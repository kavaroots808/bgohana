
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
import { doc, getDocs, query, where, collection, writeBatch } from 'firebase/firestore';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import type { Distributor } from '@/lib/types';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

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
        status: 'not-funded',
        rank: 'LV0',
        parentId: null,
        placementId: null,
        personalVolume: 0,
        recruits: 0,
        commissions: 0,
        sponsorSelected: false,
        referralCode: nanoid(),
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
    if (!firestore) throw new Error("Firestore is not available.");

    // Check if a distributor profile with this email already exists (pre-registered by admin)
    const distributorsRef = collection(firestore, 'distributors');
    const q = query(distributorsRef, where("email", "==", email));
    const existingUserSnapshot = await getDocs(q);

    if (!existingUserSnapshot.empty) {
        // This email is pre-registered. Link the new auth account to the existing profile.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const oldDoc = existingUserSnapshot.docs[0];
        const oldDocData = oldDoc.data() as Distributor;
        
        const batch = writeBatch(firestore);

        // 1. Create a new distributor document with the Firebase Auth UID as the ID
        const newDocRef = doc(firestore, 'distributors', newUser.uid);
        const updatedData = {
            ...oldDocData,
            id: newUser.uid, // Update the ID field
            name: name || oldDocData.name, // Use new name if provided, otherwise keep old
            email: newUser.email || oldDocData.email, // Use official email from auth
        };
        batch.set(newDocRef, updatedData);

        // 2. Delete the old document
        batch.delete(oldDoc.ref);
        
        await batch.commit();

        await updateProfile(newUser, { displayName: name });
        return userCredential;

    } else {
        // This is a brand new user.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        if (newUser) {
          await updateProfile(newUser, { displayName: name });
          createDistributorDocument(firestore, newUser, name);
        }
        return userCredential;
    }
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logInAsGuest = async () => {
    const guestCredential = await signInAnonymously(auth);
    const guestUser = guestCredential.user;
    if (guestUser && firestore) {
        const guestName = `Guest_${nanoid(4)}`;
        await updateProfile(guestUser, { displayName: guestName });
        createDistributorDocument(firestore, guestUser, guestName);
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
