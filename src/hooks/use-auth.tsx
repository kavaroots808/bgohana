
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
import { doc, getDocs, query, where, collection, writeBatch, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
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

const createDistributorDocument = async (firestore: any, user: User, name: string) => {
    const distributorRef = doc(firestore, 'distributors', user.uid);
    const referralCode = nanoid();
    const newDistributorData: Omit<Distributor, 'id' | 'children'> = {
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
        referralCode: referralCode,
    };
    
    await setDoc(distributorRef, { ...newDistributorData, id: user.uid });
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

    const distributorsRef = collection(firestore, 'distributors');
    const q = query(distributorsRef, where("email", "==", email));
    const existingUserSnapshot = await getDocs(q);

    if (!existingUserSnapshot.empty) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const oldDoc = existingUserSnapshot.docs[0];
        const oldDocData = oldDoc.data() as Distributor;
        
        const batch = writeBatch(firestore);

        const newDocRef = doc(firestore, 'distributors', newUser.uid);
        const updatedData: Distributor = {
            ...oldDocData,
            id: newUser.uid, 
            name: name || oldDocData.name, 
            email: newUser.email || oldDocData.email,
            referralCode: oldDocData.referralCode || nanoid(),
        };
        batch.set(newDocRef, updatedData);

        batch.delete(oldDoc.ref);
        
        await batch.commit();

        await updateProfile(newUser, { displayName: name });
        return userCredential;

    } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        if (newUser) {
          await updateProfile(newUser, { displayName: name });
          await createDistributorDocument(firestore, newUser, name);
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
        await createDistributorDocument(firestore, guestUser, guestName);
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
