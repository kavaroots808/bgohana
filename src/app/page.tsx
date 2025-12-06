
'use client';
import { AppHeader } from '@/components/header';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Distributor } from '@/lib/types';

function HomeComponent() {
  const { user, loading: authLoading } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();

  const userDistributorRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'distributors', user.uid);
  }, [user, firestore]);

  const { data: distributorDoc, isLoading: distributorLoading } = useDoc<Distributor>(userDistributorRef);

  const isLoading = authLoading || distributorLoading;

  useEffect(() => {
    // IMPORTANT: Only run logic when all loading is fully complete.
    if (!isLoading) {
      // 1. If there's no authenticated user after loading, they must log in.
      if (!user) {
        router.push('/login');
        return;
      }
      
      // 2. If there IS a user, but we couldn't find their distributor document,
      // this could be a new signup that hasn't completed onboarding.
      if (!distributorDoc) {
          // This state can occur if the user is authenticated but the distributor doc creation
          // is pending or failed. Redirecting to login is a safe fallback.
          console.warn("User is logged in, but distributor document not found after loading. Redirecting to login.");
          router.push('/login');
          return;
      }

      // 3. If we have the user AND their distributor data, check for onboarding completion.
      if (distributorDoc && !distributorDoc.sponsorSelected) {
        // Exception: The root admin user does not need a sponsor.
        if (user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          router.push('/onboarding/select-sponsor');
        }
      }
    }
    // This effect should ONLY re-run when the loading state or the relevant data changes.
  }, [user, distributorDoc, isLoading, router]);


  // Show a loading screen while authentication or data fetching is in progress.
  if (isLoading) {
    return (
        <div className="flex flex-col h-screen bg-background">
          <AppHeader />
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        </div>
    );
  }

  // If we reach here, all loading is complete and the user is authenticated
  // and has a sponsor (if required). It's now safe to render the main page content.
  // We add an extra check to ensure we don't render the tree for users about to be redirected.
  if (!user || (distributorDoc && !distributorDoc.sponsorSelected && user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2')) {
    return (
      <div className="flex flex-col h-screen bg-background">
          <AppHeader />
          <div className="flex-1 flex items-center justify-center">
            <p>Redirecting...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex-1 overflow-x-auto main-bg relative">
        <GenealogyTree />
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <AuthProvider>
      <HomeComponent />
    </AuthProvider>
  );
}
