
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
        // This case handles guest users or users created where a profile wasn't immediately made
        const newDistro = await createDistributorDocument(fs, firebaseUser, firebaseUser.displayName);
        setDistributor(newDistro);
    } else {
        // This can happen for a brief moment between user creation and profile creation
        setDistributor(null);
    }
  }, []);


  useEffect(() => {
    setIsUserLoading(true); // Start loading when provider mounts or dependencies change
    if (isFirebaseLoading) {
      // If the core Firebase services are still loading, wait.
      return;
    }

    if (!auth || !firestore) {
      // If services are not available, stop loading and set user to null.
      setUser(null);
      setDistributor(null);
      setIsUserLoading(false);
      return;
    }
    
    // Subscribe to auth state changes. This is the primary driver of user state.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser); // Update the user state immediately
      
      if (firebaseUser) {
        await fetchDistributorProfile(firebaseUser, firestore);
      } else {
        // If no user, clear the distributor profile.
        setDistributor(null);
      }
      
      // We are done with the initial auth check.
      setIsUserLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isFirebaseLoading, auth, firestore, fetchDistributorProfile]);

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

    // Step 1: Create the user in Firebase Auth. This gives them an authenticated session.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });
    
    try {
      // Step 2: Now that the user is authenticated, query for the registration code.
      // This read operation is now permitted by the `allow read: if isSignedIn()` rule.
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

      // Step 3: Atomically transfer data and delete the placeholder.
      const batch = writeBatch(firestore);
      const newDocRef = doc(firestore, 'distributors', newUser.uid);
      
      const finalDistributorData = {
          ...placeholderData,
          id: newUser.uid, // Set the document ID to the user's UID
          uid: newUser.uid, // Explicitly add the UID to the document data
          name: name,
          email: email,
          registrationCode: null, // Clear the one-time code
          status: 'funded' as const, // Mark as funded upon claim
      };
      
      batch.set(newDocRef, finalDistributorData);
      batch.delete(placeholderDoc.ref);
      
      await batch.commit();

      // The onAuthStateChanged listener will automatically pick up the new user and their profile.
      return userCredential;

    } catch (error) {
      // If any part of the Firestore operation fails, we should delete the newly created auth user
      // to allow them to try the process again cleanly.
      await newUser.delete();
      // Re-throw the error to be caught by the UI.
      throw error;
    }
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
