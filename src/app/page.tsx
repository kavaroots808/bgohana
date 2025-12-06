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

  const distributorRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'distributors', user.uid);
  }, [firestore, user?.uid]);

  const { data: distributor, isLoading: distributorLoading } = useDoc<Distributor>(distributorRef);

  const isLoading = authLoading || distributorLoading;

  useEffect(() => {
    // Only run redirection logic when loading is fully complete for both auth and distributor data.
    if (!isLoading) {
      // If there is no authenticated user after loading is done, redirect to login.
      if (!user) {
        router.push('/login');
        return;
      }

      // If there IS a user but their distributor data is missing, this is an error state.
      // Redirect to login to allow the system to re-attempt profile creation or re-auth.
      if (!distributor) {
        console.error("Distributor document not found for authenticated user. Redirecting to login.");
        router.push('/login');
        return;
      }

      // If the user and distributor doc exist, check if onboarding is complete.
      // The root admin (ID eFcPNPK048PlHyNqV7cAz57ukvB2) does not need a sponsor.
      if (!distributor.sponsorSelected && user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
        router.push('/onboarding/select-sponsor');
      }
    }
  }, [user, distributor, isLoading, router]);


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
  if (user && distributor && (distributor.sponsorSelected || user.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2')) {
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
