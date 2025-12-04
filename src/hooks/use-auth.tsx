
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
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import type { Distributor } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  logOut: () => Promise<void>;
  logInAsGuest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDistributorDocument = (firestore: any, user: User, name: string) => {
    const distributorRef = doc(firestore, 'distributors', user.uid);
    const newDistributorData: Omit<Distributor, 'id' | 'children' > = {
        name: name,
        email: user.email || '',
        avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        joinDate: new Date().toISOString(),
        status: 'active',
        rank: 'LV0',
        parentId: null,
        placementId: null,
        personalVolume: 0,
        recruits: 0,
        commissions: 0,
        sponsorSelected: false,
    };
    
    // Use non-blocking write with contextual error handling
    setDocumentNonBlocking(distributorRef, newDistributorData, { merge: false });
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    if (newUser) {
      await updateProfile(newUser, { displayName: name });

      if (firestore) {
        createDistributorDocument(firestore, newUser, name);
      }
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logInAsGuest = async () => {
    const guestCredential = await signInAnonymously(auth);
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
