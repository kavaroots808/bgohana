
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
import { doc, getDoc, setDoc, query, collection, where, getDocs, writeBatch, updateDoc, Firestore } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Distributor } from '@/lib/types';
import { customAlphabet } from 'nanoid';
import { useAdmin } from './use-admin';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

interface AuthContextType {
  user: User | null;
  distributor: Distributor | null;
  auth: Auth | null;
  isUserLoading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string, registrationCode?: string) => Promise<any>;
  logOut: () => Promise<void>;
  logInAsGuest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDistributorDocument = async (firestore: Firestore, user: User, name: string, extraData: Partial<Omit<Distributor, 'id' | 'children'>> = {}) => {
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
            registrationCode: null,
            ...extraData,
        };
        await setDoc(distributorRef, newDistributorData);
        return newDistributorData as Distributor;
    }
    return docSnap.data() as Distributor;
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();
  const { enableAdminMode } = useAdmin();
  const [user, setUser] = useState<User | null>(null);
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseLoading || !auth || !firestore) {
      setIsUserLoading(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsUserLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser); // Set Firebase user immediately
        
        // Admin check
        if (firebaseUser.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          enableAdminMode();
        }
        
        // Now, fetch the distributor profile
        const docRef = doc(firestore, 'distributors', firebaseUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDistributor(docSnap.data() as Distributor);
          } else {
            // This can happen for a user in Auth but with no Firestore doc (e.g., failed signup)
            // Or for a very brief moment during signup before the doc is created.
            // The signUp function handles creating the document, so setting to null here is safe.
            setDistributor(null);
          }
        } catch (error) {
            console.error("Error fetching distributor profile:", error);
            setDistributor(null);
        }
      } else {
        // User is logged out
        setUser(null);
        setDistributor(null);
      }
      setIsUserLoading(false); // Loading is complete
    });
    
    return () => unsubscribe();
  }, [auth, firestore, isFirebaseLoading, enableAdminMode]);

 const signUp = async (email: string, password: string, name: string, registrationCode?: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    let finalDistributorProfile: Distributor;
    
    // Create the Firebase Auth user first, regardless of the flow.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Set their display name in Auth
    await updateProfile(newUser, { displayName: name });

    // Handle pre-registration flow
    if (registrationCode && registrationCode.trim() !== '') {
        const q = query(collection(firestore, 'distributors'), where("registrationCode", "==", registrationCode.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Clean up the created auth user if the code is invalid, then throw error.
            await newUser.delete();
            throw new Error("Invalid registration code. Please check the code and try again.");
        }

        const placeholderDoc = querySnapshot.docs[0];
        const placeholderData = placeholderDoc.data() as Distributor;

        // The new document will use the new user's UID as its ID
        const newDocRef = doc(firestore, 'distributors', newUser.uid);
        
        // Copy all data from placeholder, then override with new user info.
        // This preserves the genealogy structure (parentId, placementId, rank etc.)
        const newDistributorData: Omit<Distributor, 'children'> = {
            ...placeholderData,
            id: newUser.uid,
            name: name,
            email: email,
            avatarUrl: placeholderData.avatarUrl || `https://i.pravatar.cc/150?u=${newUser.uid}`,
            joinDate: placeholderData.joinDate || new Date().toISOString(), // Keep original join date if it exists
            registrationCode: null, // Consume the code so it can't be used again
        };

        // Use a batch to perform an atomic write: create the new doc and delete the old one.
        const batch = writeBatch(firestore);
        batch.set(newDocRef, newDistributorData);
        batch.delete(placeholderDoc.ref);
        await batch.commit();

        finalDistributorProfile = newDistributorData as Distributor;

    } else {
        // Standard signup without a registration code
        finalDistributorProfile = await createDistributorDocument(firestore, newUser, name) as Distributor;
    }
    
    setDistributor(finalDistributorProfile);
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
        const newDistributor = await createDistributorDocument(firestore, guestUser, guestName, {
            sponsorSelected: true,
            parentId: 'eFcPNPK048PlHyNqV7cAz57ukvB2',
            placementId: 'eFcPNPK048PlHyNqV7cAz57ukvB2',
        });
        setDistributor(newDistributor);
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
    distributor, 
    auth,
    isUserLoading,
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
