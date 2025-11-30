
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
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  logOut: () => Promise<void>;
  logInAsGuest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    if (newUser && firestore) {
      const distributorRef = doc(firestore, 'distributors', newUser.uid);
      
      const newDistributorData = {
          id: newUser.uid,
          name: name,
          email: email,
          avatarUrl: `https://i.pravatar.cc/150?u=${newUser.uid}`,
          joinDate: new Date().toISOString(),
          status: 'active',
          rank: 'LV0',
          parentId: '1', // Default to root, can be changed
          placementId: '1',
          personalVolume: 0,
          recruits: 0,
          commissions: 0,
      };

      await setDoc(distributorRef, newDistributorData);
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
