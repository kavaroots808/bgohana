
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
  const { user, loading } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();

  const userDistributorRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'distributors', user.uid);
  }, [user, firestore]);

  const { data: distributorDoc, isLoading: isDistributorLoading } = useDoc<Distributor>(userDistributorRef);

  useEffect(() => {
    // Wait until all loading is finished before making any redirect decisions.
    if (loading || isDistributorLoading) {
      return; // Do nothing while loading.
    }

    // After loading, if there's no user, redirect to login.
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If the user is authenticated and their distributor data is loaded:
    // Check if they need to be onboarded.
    if (distributorDoc && !distributorDoc.sponsorSelected) {
       // Exception for the root admin who has no sponsor.
      if (user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
        router.push('/onboarding/select-sponsor');
      }
    }
  }, [user, loading, distributorDoc, isDistributorLoading, router]);

  // Show a loading screen while authentication or data fetching is in progress.
  if (loading || isDistributorLoading) {
    return (
        <div className="flex flex-col h-screen bg-background">
          <AppHeader />
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        </div>
    );
  }

  // If we reach here, the user is authenticated and their data is loaded.
  // It's now safe to render the main page content.
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
