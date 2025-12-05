
'use client';
import { AppHeader } from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import type { Distributor } from '@/lib/types';
import { doc } from 'firebase/firestore';


function HomeComponent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'distributors', user.uid);
  }, [firestore, user]);

  const { data: distributor, isLoading: isDistributorLoading } = useDoc<Distributor>(userDocRef);

  useEffect(() => {
    // Wait until both auth and firestore loading is complete before making any routing decisions
    if (!loading && !isDistributorLoading) {
      if (!user) {
        // If there's no user object, they need to log in.
        router.push('/login');
      } else if (distributor && !distributor.sponsorSelected) {
        // If we have a user and their profile, but they haven't selected a sponsor.
        router.push('/onboarding/select-sponsor');
      }
      // If user is logged in, has a distributor profile, and has selected a sponsor, they stay on this page.
    }
  }, [user, loading, distributor, isDistributorLoading, router]);

  // Show a loading screen while auth state or user data is being determined.
  if (loading || isDistributorLoading || !user || !distributor) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  // Render the main content only if the user is fully authenticated, has a profile, and has completed onboarding.
  if (user && distributor && distributor.sponsorSelected) {
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

  // Fallback loading screen for any other intermediate state.
  return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
}


export default function Home() {
  return (
    <AuthProvider>
      <HomeComponent />
    </AuthProvider>
  );
}
