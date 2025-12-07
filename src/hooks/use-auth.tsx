
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
import { doc, getDoc, setDoc, query, collection, where, getDocs, updateDoc, writeBatch, Firestore } from 'firebase/firestore';
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
        
        const docRef = doc(firestore, 'distributors', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDistributor({ id: docSnap.id, ...docSnap.data() } as Distributor);
        } else {
             const q = query(collection(firestore, 'distributors'), where("email", "==", firebaseUser.email));
             const querySnapshot = await getDocs(q);
             if (!querySnapshot.empty) {
                 const preRegisteredDoc = querySnapshot.docs[0];
                 if(preRegisteredDoc.data().uid) { // Already claimed by another auth user
                    setDistributor(preRegisteredDoc.data() as Distributor);
                 } else { // First time login after password reset for pre-reg
                    const batch = writeBatch(firestore);
                    const newDocRef = doc(firestore, 'distributors', firebaseUser.uid);
                    const data = preRegisteredDoc.data();

                    data.uid = firebaseUser.uid;
                    data.email = firebaseUser.email!;
                    
                    batch.set(newDocRef, data);
                    batch.delete(preRegisteredDoc.ref);
                    
                    await batch.commit();
                    setDistributor(data as Distributor);
                 }
             } else if (firebaseUser.displayName) {
                const newDistro = await createDistributorDocument(firestore, firebaseUser, firebaseUser.displayName);
                setDistributor(newDistro);
            } else {
                setDistributor(null);
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
    
    const q = query(collection(firestore, 'distributors'), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        throw new Error("An account with this email already exists or is pre-registered. Please log in or claim your account.");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });
    
    const finalDistributorProfile = await createDistributorDocument(firestore, newUser, name);
    setDistributor(finalDistributorProfile);
    return userCredential;
  };

  const claimAccount = async (email: string, password: string, name: string, registrationCode: string) => {
    if (!auth || !firestore) throw new Error("Firebase services not available.");

    // 1. Create the user in Firebase Auth FIRST. This gives them an authenticated session.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });

    // 2. NOW that the user is authenticated, find the pre-registered account. This read is now allowed.
    const q = query(collection(firestore, 'distributors'), where("registrationCode", "==", registrationCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If code is invalid, delete the just-created auth user to prevent orphaned accounts.
      await newUser.delete();
      throw new Error("Invalid registration code. Please check the code and try again.");
    }
    
    const placeholderDoc = querySnapshot.docs[0];
    const placeholderData = placeholderDoc.data() as Omit<Distributor, 'id'>;

    if (placeholderData.uid) {
        // As a safeguard, if the account is already claimed, delete the new auth user.
        await newUser.delete();
        throw new Error("This account has already been claimed. Please try logging in or use the 'Forgot Password' link.");
    }

    // 3. Atomically transfer data to the new permanent doc and delete the placeholder.
    const batch = writeBatch(firestore);
    
    const newDocRef = doc(firestore, 'distributors', newUser.uid);
    
    const finalDistributorData = {
        ...placeholderData,
        id: newUser.uid,
        uid: newUser.uid,
        name: name,
        email: email,
        registrationCode: null, // Consume the code
        status: 'funded' as const,
    };
    
    batch.set(newDocRef, finalDistributorData);
    batch.delete(placeholderDoc.ref);
    
    await batch.commit();

    // The onAuthStateChanged listener will automatically pick up the new user and their profile.
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
            placementId: 'eFcPNPK0-48PlHyNqV7cAz57ukvB2',
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
