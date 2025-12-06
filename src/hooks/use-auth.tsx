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
import { doc, getDoc, setDoc, query, collection, where, getDocs, updateDoc, writeBatch, Firestore, deleteDoc } from 'firebase/firestore';
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
            registrationCode: `reg-${nanoid(10)}`,
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
      // Always start in a loading state when auth changes
      setLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser);

        // Check for special admin user
        if (firebaseUser.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          enableAdminMode();
        }
        
        // Fetch the corresponding distributor document
        const distributorRef = doc(firestore, 'distributors', firebaseUser.uid);
        const docSnap = await getDoc(distributorRef);
        
        if (docSnap.exists()) {
          setDistributor(docSnap.data() as Distributor);
        } else {
           // This case is important: user is authenticated but has no profile
           // Could happen if profile creation fails or is deleted
           setDistributor(null);
        }
      } else {
        // User is logged out
        setUser(null);
        setDistributor(null);
      }

      // Only finish loading after all async operations for the auth state are complete
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth, firestore, isFirebaseLoading, enableAdminMode]);

 const signUp = async (email: string, password: string, name: string, registrationCode?: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    if (registrationCode) {
        const q = query(collection(firestore, 'distributors'), where("registrationCode", "==", registrationCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Invalid registration code. Please check the code and try again.");
        }

        const existingDoc = querySnapshot.docs[0];
        const existingDocData = existingDoc.data() as Distributor;
        
        // Check if the pre-registered account has already been claimed (i.e. if its ID is a Firebase UID)
        if (existingDocData.id && !existingDocData.id.startsWith('placeholder-')) {
            const userCredential = await signInWithEmailAndPassword(auth, existingDocData.email, password).catch(() => {
                throw new Error("This account has already been claimed. Please log in.");
            });
            if (userCredential) {
                 throw new Error("This account has already been claimed. Please log in.");
            }
        }
        

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        const batch = writeBatch(firestore);

        // Create a new document with the user's UID
        const newUserDocRef = doc(firestore, 'distributors', newUser.uid);
        const updatedData = {
            ...existingDocData,
            id: newUser.uid, // This is the crucial step: linking the Auth UID
            name: name,
            email: email,
            registrationCode: null, // Consume the registration code
        };
        batch.set(newUserDocRef, updatedData);

        // Delete the old placeholder document
        batch.delete(existingDoc.ref);

        await batch.commit();
        await updateProfile(newUser, { displayName: name });
        
        return userCredential;
    }

    // This is a brand new user, not pre-registered.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    if (newUser) {
      await updateProfile(newUser, { displayName: name });
      // Create a brand new distributor document for this new user.
      await createDistributorDocument(firestore, newUser, name, {
          parentId: null,
          placementId: null,
          sponsorSelected: false,
      });
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available.");
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logInAsGuest = async () => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");
    setLoading(true);
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
      setLoading(true);
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
