
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

  const isLoading = authLoading || (user && distributorLoading);

  useEffect(() => {
    // Only run redirection logic when all loading is fully complete.
    if (!isLoading) {
      // If there is no authenticated user after loading is done, redirect to login.
      if (!user) {
        router.push('/login');
        return;
      }

      // If there IS a user, check their distributor document for onboarding status.
      if (distributorDoc) {
        // Redirect to sponsor selection if onboarding is not complete.
        // Exception: The root admin does not need a sponsor.
        if (!distributorDoc.sponsorSelected && user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          router.push('/onboarding/select-sponsor');
        }
      } else if (user) {
        // This is an edge case where Auth is complete but Firestore doc is missing.
        // This can happen if the doc creation failed during signup.
        // A safe fallback is to send them back to login to restart the process.
        console.error("User document not found for authenticated user. Redirecting to login.");
        router.push('/login');
      }
    }
  }, [user, distributorDoc, isLoading, router]);


  // Render a loading screen while waiting for auth and data.
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

  // If we have a user and their required data, render the main content.
  // This condition prevents rendering the tree for users who are about to be redirected.
  if (user && distributorDoc && (distributorDoc.sponsorSelected || user.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2')) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <div className="flex-1 overflow-x-auto main-bg relative">
          <GenealogyTree />
        </div>
      </div>
    );
  }

  // Fallback "Redirecting..." screen for cases where a redirect is pending.
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center">
        <p>Redirecting...</p>
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
