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
    // Only run redirection logic when loading is fully complete.
    if (!isLoading) {
      if (!user) {
        // If there's no user after loading, redirect to login.
        router.push('/login');
      } else if (!distributor) {
        // If there IS a user but their data is missing (error state), redirect to login.
        console.error("Distributor document not found for authenticated user. Redirecting to login.");
        router.push('/login');
      } else if (!distributor.sponsorSelected && user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
        // If user is logged in, has a profile, but hasn't completed onboarding, redirect.
        router.push('/onboarding/select-sponsor');
      }
    }
  }, [user, distributor, isLoading, router]);

  // Render a loading state while waiting for auth and data.
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

  // Only render the main content if the user is fully loaded, has a profile, and has completed onboarding.
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

  // Fallback "Redirecting..." screen for cases where a redirect is pending but not yet executed.
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
