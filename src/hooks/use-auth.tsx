'use client';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, limit, getDoc } from 'firebase/firestore';
import { useFirestore, useUser as useFirebaseUser } from '@/firebase';
import { auth } from '@/lib/firebase/config';

// This custom hook now acts as a wrapper around the core Firebase user state
// and provides the app-specific signup/login functions.
export const useAuth = () => {
  const { user, isUserLoading: loading } = useFirebaseUser();
  const firestore = useFirestore();

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (user && firestore) {
      const userDocRef = doc(firestore, 'distributors', user.uid);

      // Check if this is the very first user to determine if they should be the root.
      const rootDistributorDoc = await getDoc(doc(firestore, 'distributors', '1'));
      const isFirstUser = !rootDistributorDoc.exists();

      const newDistributor = {
        id: user.uid,
        name: name,
        email: user.email,
        parentId: isFirstUser ? null : '1', // A real app would have a better root selection strategy
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
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logInAsGuest = async () => {
    return signInAnonymously(auth);
  }

  const logOut = () => {
    return signOut(auth);
  };

  return { user, loading, logIn, signUp, logOut, logInAsGuest };
};
