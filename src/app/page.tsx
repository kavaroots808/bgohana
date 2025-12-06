
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
    // This ref depends on the user. It will be null until the user is available.
    if (!user || !firestore) return null;
    return doc(firestore, 'distributors', user.uid);
  }, [user, firestore]);

  // This hook will be in a loading state until userDistributorRef is not null.
  const { data: distributorDoc, isLoading: distributorLoading } = useDoc<Distributor>(userDistributorRef);

  // isLoading is true if either auth is loading OR if distributor doc is loading.
  // distributorLoading will be true if user is not yet available.
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
      // something is wrong. For now, we'll send them to login to be safe.
      // In a real app, this might go to an error page.
      if (!distributorDoc) {
          // This case can happen for a brief moment if the doc hasn't been created yet after signup.
          // However, if it persists after loading, it's an issue.
          console.error("User is logged in, but distributor document not found.");
          // To be safe, let's not redirect here immediately to avoid loops on new signups.
          // The check below for sponsor selection is more important.
      }

      // 3. If we have the user AND their distributor data, check for onboarding.
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
