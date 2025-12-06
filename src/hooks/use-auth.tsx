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
import { doc, getDoc, setDoc, query, collection, where, getDocs, writeBatch, Firestore } from 'firebase/firestore';
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
    if (isFirebaseLoading || !auth) {
      setIsUserLoading(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsUserLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
        if (firebaseUser.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          enableAdminMode();
        }
         const docRef = doc(firestore, 'distributors', firebaseUser.uid);
         const docSnap = await getDoc(docRef);
         if (docSnap.exists()) {
             setDistributor(docSnap.data() as Distributor);
         } else {
             // This can happen if a user is in Auth but the Firestore doc creation failed.
             // Or for a new user signing up. The `signUp` function will handle doc creation.
             setDistributor(null);
         }
      } else {
        setDistributor(null); 
      }
      setIsUserLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth, firestore, isFirebaseLoading, enableAdminMode]);

 const signUp = async (email: string, password: string, name: string, registrationCode?: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    let userCredential;

    if (registrationCode) {
        const q = query(collection(firestore, 'distributors'), where("registrationCode", "==", registrationCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Invalid registration code. Please check the code and try again.");
        }

        const existingDoc = querySnapshot.docs[0];
        const existingDocData = existingDoc.data() as Distributor;
        
        if (existingDocData.id && !existingDocData.id.startsWith('placeholder-')) {
            throw new Error("This account has already been claimed. Please use the login page.");
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        const batch = writeBatch(firestore);

        const newUserDocRef = doc(firestore, 'distributors', newUser.uid);
        const updatedData = {
            ...existingDocData,
            id: newUser.uid,
            name: name,
            email: email,
            registrationCode: null,
        };
        batch.set(newUserDocRef, updatedData);

        batch.delete(existingDoc.ref);

        await batch.commit();
        await updateProfile(newUser, { displayName: name });
        setDistributor(updatedData as Distributor);
    } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        if (newUser) {
          await updateProfile(newUser, { displayName: name });
          const newDistributorProfile = await createDistributorDocument(firestore, newUser, name);
          setDistributor(newDistributorProfile as Distributor);
        }
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

    