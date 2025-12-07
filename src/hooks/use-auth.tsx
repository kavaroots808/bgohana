
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

  useEffect(() => {
    if (isFirebaseLoading || !auth || !firestore) {
      setIsUserLoading(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsUserLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        if (firebaseUser.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          enableAdminMode();
        }
        
        // Find the user's profile, whether the doc ID is their UID or it's linked via the 'uid' field
        const docRef = doc(firestore, 'distributors', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDistributor({ id: docSnap.id, ...docSnap.data() } as Distributor);
        } else {
           const q = query(collection(firestore, 'distributors'), where("uid", "==", firebaseUser.uid));
           const querySnapshot = await getDocs(q);
           if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              setDistributor({ id: userDoc.id, ...userDoc.data() } as Distributor);
           } else {
             // Edge case: Auth user exists but no distributor record. Maybe a new signup.
             // Let's create one if their display name is available.
              if (firebaseUser.displayName) {
                const newDistro = await createDistributorDocument(firestore, firebaseUser, firebaseUser.displayName);
                setDistributor(newDistro);
              } else {
                setDistributor(null);
              }
           }
        }
      } else {
        setUser(null);
        setDistributor(null);
      }
      setIsUserLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth, firestore, isFirebaseLoading, enableAdminMode]);

 const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");
    
    // Check if an account with this email already exists in either Auth or Firestore (pre-registered)
    const q = query(collection(firestore, 'distributors'), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        throw new Error("An account with this email already exists or is pre-registered. Please log in or claim your account.");
    }
    
    // Standard new user signup
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });
    
    const finalDistributorProfile = await createDistributorDocument(firestore, newUser, name);
    setDistributor(finalDistributorProfile);
    return userCredential;
  };

  const claimAccount = async (email: string, password: string, name: string, registrationCode: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    // 1. Find the pre-registered account by registrationCode
    const q = query(collection(firestore, 'distributors'), where("registrationCode", "==", registrationCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid registration code. Please check the code and try again.");
    }
    if (querySnapshot.docs.length > 1) {
      // This should not happen with unique codes, but it's a good safeguard.
      throw new Error("This registration code is linked to multiple accounts. Please contact support.");
    }

    const preRegisteredDoc = querySnapshot.docs[0];
    
    // 2. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });

    // 3. Update the existing Firestore document IN-PLACE
    const docRef = preRegisteredDoc.ref;
    await updateDoc(docRef, {
      uid: newUser.uid, // Link the auth account
      name: name, // Update the name
      email: email, // Update the email
      registrationCode: null, // Nullify the code so it can't be reused
      status: 'funded', // Optional: Automatically mark them as funded upon claiming
    });

    const updatedDocSnap = await getDoc(docRef);
    setDistributor({ id: updatedDocSnap.id, ...updatedDocSnap.data() } as Distributor);

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
        const newDistributor = await createDistributorDocument(firestore, guestUser, guestName, {
            sponsorSelected: true,
            parentId: 'eFcPNPK048PlHyNqV7cAz57ukvB2',
            placementId: 'eFcPNPK048PlHyNqV7cAz57ukvB2',
        });
        setDistributor(newDistributor);
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
