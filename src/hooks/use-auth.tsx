
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  signUp: (email: string, password: string, name: string) => Promise<any>;
  claimAccount: (email: string, password: string, name: string, registrationCode: string) => Promise<any>;
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
  const [isUserLoading, setIsUserLoading] = useState(true);

  const fetchDistributorProfile = useCallback(async (firebaseUser: User | null, fs: Firestore | null) => {
    if (!firebaseUser || !fs) {
      setDistributor(null);
      return;
    }
    const docRef = doc(fs, 'distributors', firebaseUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setDistributor({ id: docSnap.id, ...docSnap.data() } as Distributor);
    } else if (firebaseUser.displayName) {
        const newDistro = await createDistributorDocument(fs, firebaseUser, firebaseUser.displayName);
        setDistributor(newDistro);
    } else {
        setDistributor(null);
    }
  }, []);

  useEffect(() => {
    if (isFirebaseLoading) {
      setIsUserLoading(true);
      return;
    }

    if (!auth || !firestore) {
      setIsUserLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (firebaseUser.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          enableAdminMode();
        }
        await fetchDistributorProfile(firebaseUser, firestore);
      } else {
        setDistributor(null);
      }
      setIsUserLoading(false);
    });
    
    return () => unsubscribe();
  }, [isFirebaseLoading, auth, firestore, enableAdminMode, fetchDistributorProfile]);

 const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");
    
    const q = query(collection(firestore, 'distributors'), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        throw new Error("An account with this email already exists or is pre-registered. Please log in or claim your account.");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });
    await createDistributorDocument(firestore, newUser, name, { sponsorSelected: false });
    return userCredential;
  };

  const claimAccount = async (email: string, password: string, name: string, registrationCode: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    // Find the pre-registered account FIRST. This is now allowed by security rules.
    const q = query(collection(firestore, 'distributors'), where("registrationCode", "==", registrationCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid registration code. Please check the code and try again.");
    }
    
    const placeholderDoc = querySnapshot.docs[0];
    const placeholderData = placeholderDoc.data() as Omit<Distributor, 'id'>;

    if (placeholderData.uid) {
        throw new Error("This account has already been claimed. Please try logging in or use the 'Forgot Password' link.");
    }

    // Now, create the user in Firebase Auth.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });

    // Atomically transfer data and delete the placeholder.
    const batch = writeBatch(firestore);
    const newDocRef = doc(firestore, 'distributors', newUser.uid);
    
    const finalDistributorData = {
        ...placeholderData,
        id: newUser.uid,
        uid: newUser.uid,
        name: name,
        email: email,
        registrationCode: null, // Clear the one-time code
        status: 'funded' as const,
    };
    
    batch.set(newDocRef, finalDistributorData);
    batch.delete(placeholderDoc.ref);
    
    await batch.commit();

    // The onAuthStateChanged listener will pick up the user and their new profile.
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
    distributor, 
    auth,
    isUserLoading,
    logIn,
    signUp,
    claimAccount,
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
