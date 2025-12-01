
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
import { useFirebase } from '@/firebase';
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

const createDistributorDocument = async (firestore: any, user: User, name: string) => {
    // The admin user is the root of the tree and has no parent.
    const isAdmin = user.uid === '3HnlVIX0LXdkIynM14QVKn4YP0b2';
    const parentId = isAdmin ? null : '3HnlVIX0LXdkIynM14QVKn4YP0b2';

    const distributorRef = doc(firestore, 'distributors', user.uid);
    const newDistributorData: Omit<Distributor, 'children'> = {
        id: user.uid,
        name: name,
        email: user.email || '',
        avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        joinDate: new Date().toISOString(),
        status: 'active',
        rank: 'LV0',
        parentId: parentId,
        placementId: parentId,
        personalVolume: 0,
        recruits: 0,
        commissions: 0,
    };
    await setDoc(distributorRef, newDistributorData);
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    if (newUser) {
      // Update Firebase Auth profile
      await updateProfile(newUser, { displayName: name });

      // Create distributor document in Firestore
      if (firestore) {
        await createDistributorDocument(firestore, newUser, name);
      }
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logInAsGuest = async () => {
    const guestCredential = await signInAnonymously(auth);
    // You might want to create a guest distributor doc here if needed
    return guestCredential;
  }

  const logOut = () => {
    return signOut(auth);
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
