
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
import { doc, getDoc, setDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
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
        
        // This is a critical step: create the auth user FIRST.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        await updateProfile(newUser, { displayName: name });
        
        // **CORRECTED STRATEGY**: Update the existing document with the new user's information.
        // This is simpler and avoids the need for complex security rules or batch writes to move data.
        const existingDocRef = existingDistributorDoc.ref;
        await updateDoc(existingDocRef, {
            id: newUser.uid, // Critically, link the document to the new Auth UID.
            name: name,
            email: email,
            sponsorSelected: true, // The user is now fully onboarded and has claimed their profile.
        });

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
