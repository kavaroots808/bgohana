
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
    if (!loading && !isDistributorLoading) {
      if (!user) {
        router.push('/login');
      } else if (distributor && !distributor.sponsorSelected) {
        // This is a new user who hasn't selected a sponsor yet.
        router.push('/onboarding/select-sponsor');
      }
    }
  }, [user, loading, distributor, isDistributorLoading, router]);

  if (loading || isDistributorLoading || !user || !distributor) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
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
  )
}


export default function Home() {
  return (
    <AuthProvider>
      <HomeComponent />
    </AuthProvider>
  );
}
