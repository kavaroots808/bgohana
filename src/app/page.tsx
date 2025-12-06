
'use client';
import { AppHeader } from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
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
  // This prevents rendering the page with incomplete data that could trigger redirects.
  if (loading || isDistributorLoading) {
    return <div className="h-screen flex items-center justify-center"><p>Loading...</p></div>
  }

  // If the user is logged in but their distributor doc doesn't exist yet, show loading.
  // This can happen for a brief moment after signup.
  if (user && !distributorDoc) {
    return <div className="h-screen flex items-center justify-center"><p>Loading user data...</p></div>
  }


  // If we reach here, the user is authenticated and their data is loaded.
  // It's now safe to render the main page content.
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 hidden lg:block border-r shrink-0">
          <AppSidebar />
        </aside>        
        <main className="flex-1 overflow-x-auto main-bg relative">
          <GenealogyTree />
        </main>
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
