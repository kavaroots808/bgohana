
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
    // Only run logic when loading is fully complete
    if (!isLoading) {
      // If there is no user after loading, redirect to login.
      if (!user) {
        router.push('/login');
        return;
      }
      
      // If there is a user and their distributor data is loaded:
      // Check if they need to select a sponsor.
      if (distributorDoc && !distributorDoc.sponsorSelected) {
        // Exception for the root admin user who does not have a sponsor.
        if (user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
          router.push('/onboarding/select-sponsor');
        }
      }
    }
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
