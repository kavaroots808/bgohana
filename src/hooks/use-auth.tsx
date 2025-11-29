'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInAnonymously,
    User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  logOut: () => Promise<any>;
  logInAsGuest: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (user && firestore) {
      // Create a new distributor document in Firestore
      const userDocRef = doc(firestore, 'distributors', user.uid);

      // Check if user is the very first user, make them root.
      const allUsersRef = doc(firestore, 'distributors', 'all');
      const allUsersSnap = await getDoc(allUsersRef);
      let isFirstUser = !allUsersSnap.exists();
      
      const newDistributor = {
        id: user.uid,
        name: name,
        email: user.email,
        parentId: isFirstUser ? null : '1', // Default to root user '1' if not first. This needs a real strategy.
        placementId: isFirstUser ? null : '1',
        status: 'active',
        joinDate: new Date().toISOString(),
        personalVolume: 0,
        recruits: 0,
        commissions: 0,
        avatarUrl: `https://picsum.photos/seed/${user.uid}/200/200`,
        rank: 'LV0',
      };
      
      await setDoc(userDocRef, newDistributor);

      if (isFirstUser) {
        // This is a simple mechanism to mark that the DB is initialized
        await setDoc(allUsersRef, { initialized: true });
      }

    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logInAsGuest = async () => {
    const credentials = await signInAnonymously(auth);
    const user = credentials.user;
    // In a real app, you might want to create a guest record in the DB
    // For this demo, we'll just log them in. The tree will default to user '1'.
    return credentials;
  }

  const logOut = () => {
    return signOut(auth);
  };

  const value = { user, loading, logIn, signUp, logOut, logInAsGuest };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
