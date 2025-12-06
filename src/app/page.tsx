
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
    // This is the definitive fix. Do not run any logic until all loading is complete.
    if (isLoading) {
      return;
    }

    // After loading, if there is no user, they must log in.
    if (!user) {
      router.push('/login');
      return;
    }

    // If there IS a user, but their distributor document doesn't exist,
    // this could mean it's a brand new account that hasn't finished the signup flow,
    // or a data consistency issue. For a regular user, the safest place to send them
    // is where they can get a profile created or select a sponsor.
    // The admin user is a special case and doesn't need a profile to proceed.
    if (!distributor && user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
      console.error("Distributor document not found for authenticated user. Redirecting to select sponsor.");
      router.push('/onboarding/select-sponsor');
      return;
    }
    
    // If the distributor exists but hasn't completed sponsor selection, redirect them.
    // This does not apply to the main admin user.
    if (distributor && !distributor.sponsorSelected && user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
      router.push('/onboarding/select-sponsor');
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

  // Only render the main content if the user is fully loaded, has a profile, and has completed onboarding (or is the admin).
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

  // Fallback "Verifying session..." screen for cases where a redirect is pending but not yet executed by the useEffect hook.
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center">
        <p>Verifying session...</p>
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
