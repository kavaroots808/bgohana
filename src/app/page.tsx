
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
    if (loading || isDistributorLoading) {
      return; // Wait until auth and distributor data are loaded
    }

    if (!user) {
      // Not logged in, send to login page
      router.push('/login');
      return;
    }
    
    // If the user exists and has not selected a sponsor, redirect to onboarding.
    // This now works for both new signups and existing users who haven't been assigned a sponsor.
    if (user && distributorDoc && !distributorDoc.sponsorSelected) {
       // Exception for the root user/admin who has no sponsor
      if (user.uid !== 'eFcPNPK048PlHyNqV7cAz57ukvB2') {
        router.push('/onboarding/select-sponsor');
      }
    }
  }, [user, loading, distributorDoc, isDistributorLoading]);

  if (loading || isDistributorLoading) {
    return <div className="h-screen flex items-center justify-center"><p>Loading...</p></div>
  }

  // The restrictive navigation logic has been removed to allow for free navigation.
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
