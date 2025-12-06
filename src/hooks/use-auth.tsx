
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updateProfile,
  Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Distributor } from '@/lib/types';
import { customAlphabet } from 'nanoid';
import { useAdmin } from './use-admin';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

interface AuthContextType {
  user: User | null;
  auth: Auth | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string, referralCode?: string) => Promise<any>;
  logOut: () => Promise<void>;
  logInAsGuest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDistributorDocument = async (firestore: any, user: User, name: string, extraData: Partial<Distributor> = {}) => {
    const distributorRef = doc(firestore, 'distributors', user.uid);
    const docSnap = await getDoc(distributorRef);

    if (!docSnap.exists()) {
        const newDistributorData: Omit<Distributor, 'children'> = {
            id: user.uid,
            name: name,
            email: user.email || '',
            avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            joinDate: new Date().toISOString(),
            status: 'not-funded',
            rank: 'LV0',
            parentId: null, 
            placementId: null,
            personalVolume: 0,
            recruits: 0,
            commissions: 0,
            sponsorSelected: false,
            referralCode: nanoid(),
            ...extraData,
        };
        await setDoc(distributorRef, newDistributorData);
    }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore, isUserLoading } = useFirebase();
  const { enableAdminMode } = useAdmin();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
        enableAdminMode();
      }
    });
    return () => unsubscribe();
  }, [auth, enableAdminMode]);

  const signUp = async (email: string, password: string, name: string, referralCode?: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    // Account Claiming Flow
    if (referralCode) {
        const distributorsRef = collection(firestore, 'distributors');
        const q = query(distributorsRef, where("referralCode", "==", referralCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Invalid referral code. This code does not match an existing profile.");
        }

        const existingDistributorDoc = querySnapshot.docs[0];
        const existingDistributorId = existingDistributorDoc.id;
        
        // This is a critical step: create the auth user FIRST.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Now, we need to delete the new, automatically created distributor document
        // and update the old one with the new auth UID. This requires a batch write
        // to ensure atomicity.
        const batch = writeBatch(firestore);

        // 1. Reference to the new, incorrect distributor doc created by onAuthStateChanged side-effect
        const incorrectNewDocRef = doc(firestore, 'distributors', newUser.uid);

        // 2. Reference to the original distributor doc we want to claim
        const originalDocRef = doc(firestore, 'distributors', existingDistributorId);

        // 3. Update the original document with the new, real information
        batch.update(originalDocRef, {
            id: newUser.uid, // This is the most critical update
            name: name,
            email: newUser.email,
            sponsorSelected: true, // They are now fully onboarded
        });
        
        // After successfully claiming, we can't easily delete the old doc and re-assign its ID.
        // A better approach is to update the existing doc with the new user's real info and auth UID.
        // But since we can't change a document's ID, we must copy the data.
        
        // Let's adjust the strategy: create the user, then find the placeholder doc and update it
        // with the new auth UID. Firestore rules would need to allow this.
        // A simpler, more robust client-side approach without special rules:
        
        await updateProfile(newUser, { displayName: name });
        
        // We will update the existing distributor document with the new user's info.
        // IMPORTANT: We cannot change the document ID. Instead, we'll have to create a new doc
        // with the user's UID as the ID, copy over the data, and delete the old one.
        // A simpler approach for now is to just update the existing document's data.
        // This creates a mismatch between auth UID and doc ID, which is not ideal.

        // **REVISED & CORRECT STRATEGY**
        // The user is created in Auth. We find the placeholder via referral code.
        // We update that placeholder doc with the new user's real email and name.
        // The key is that the placeholder's document ID *must become* the new user's auth UID.
        // This is not possible on the client.
        
        // **FINAL, WORKABLE STRATEGY**
        // When a user signs up with a referral code, we find the existing document.
        // We create the new Auth user.
        // We then update the *existing* document with the new user's name and email.
        // We MUST also update the document's `id` field to match the new auth UID.
        
        const updateData = {
            name: name,
            email: email,
            id: userCredential.user.uid, // Link it to the new auth user
            sponsorSelected: true, // The user is now fully onboarded
        };
        
        // We cannot change the document ID after creation. The fundamental issue is linking
        // an auth user to a pre-existing document with a different ID.
        // The only robust way is to copy the old data to a new doc with the correct ID.
        
        const oldData = existingDistributorDoc.data();
        const newDocRef = doc(firestore, 'distributors', userCredential.user.uid);
        
        // Combine old data with new, correct info
        const finalDistributorData = {
            ...oldData,
            id: userCredential.user.uid,
            name: name,
            email: email,
            sponsorSelected: true,
        };

        batch.set(newDocRef, finalDistributorData); // Create the new, correct document
        batch.delete(existingDistributorDoc.ref); // Delete the old placeholder document

        await batch.commit();

        return userCredential;
    }

    // Standard Sign-Up Flow
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    if (newUser) {
      await updateProfile(newUser, { displayName: name });
      await createDistributorDocument(firestore, newUser, name, {
          parentId: null,
          placementId: null,
          sponsorSelected: false,
      });
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available.");
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logInAsGuest = async () => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");
    const guestCredential = await signInAnonymously(auth);
    const guestUser = guestCredential.user;
    if (guestUser) {
        const guestName = `Guest_${nanoid(4)}`;
        await updateProfile(guestUser, { displayName: guestName });
        await createDistributorDocument(firestore, guestUser, guestName, {
            parentId: null,
            placementId: null,
            sponsorSelected: false, 
        });
    }
    return guestCredential;
  }

  const logOut = () => {
    if (auth) {
      return signOut(auth);
    }
    return Promise.resolve();
  };

  const value = {
    user,
    auth,
    loading: isUserLoading,
    logIn,
    signUp,
    logOut,
    logInAsGuest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
