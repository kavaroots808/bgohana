
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
import { doc, getDoc, setDoc, query, collection, where, getDocs, updateDoc, Firestore } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Distributor } from '@/lib/types';
import { customAlphabet } from 'nanoid';
import { useAdmin } from './use-admin';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

interface AuthContextType {
  user: User | null;
  distributor: Distributor | null;
  auth: Auth | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseLoading || !auth || !firestore) {
      setLoading(true);
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        if (firebaseUser.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          enableAdminMode();
        }
        // Fetch the corresponding distributor document
        const distributorRef = doc(firestore, 'distributors', firebaseUser.uid);
        const docSnap = await getDoc(distributorRef);
        if (docSnap.exists()) {
          setDistributor(docSnap.data() as Distributor);
        } else {
          // This might happen if doc creation failed. Log it.
          console.warn(`No distributor document found for UID: ${firebaseUser.uid}`);
          setDistributor(null);
        }
      } else {
        // User is signed out
        setUser(null);
        setDistributor(null);
      }
      setLoading(false); // Loading is complete after auth check and doc fetch
    });
    
    return () => unsubscribe();
  }, [auth, firestore, isFirebaseLoading, enableAdminMode]);

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    if (newUser) {
      await updateProfile(newUser, { displayName: name });
      // Create a brand new user document
      await createDistributorDocument(firestore, newUser, name, {
          parentId: null,
          placementId: null,
          sponsorSelected: false
      });
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available.");
    setLoading(true); // Set loading true on login attempt
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logInAsGuest = async () => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");
    setLoading(true); // Set loading true on login attempt
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
      setLoading(true); // Set loading on logout
      return signOut(auth);
    }
    return Promise.resolve();
  };

  const value = {
    user,
    distributor,
    auth,
    loading,
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
