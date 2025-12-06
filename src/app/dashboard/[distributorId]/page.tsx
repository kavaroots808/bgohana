'use client';
import { AppHeader } from '@/components/header';
import { DistributorDashboard } from '@/components/distributor-dashboard';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { notFound } from 'next/navigation';
import { use, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import type { Distributor } from '@/lib/types';

function DistributorDashboardContent({ distributorId }: { distributorId: string }) {
  const { firestore } = useFirebase();

  const distributorRef = useMemoFirebase(() => {
    if (!firestore || !distributorId) return null;
    return doc(firestore, 'distributors', distributorId);
  }, [firestore, distributorId]);

  const { data: distributor, isLoading } = useDoc<Distributor>(distributorRef);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }
  
  if (!distributor) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <DistributorDashboard distributor={distributor} />
      </main>
    </div>
  );
}

function DistributorDashboardPageContainer({ distributorId }: { distributorId: string }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Authenticating...</div>;
    }

    if (!user) {
        // This should ideally redirect to login, but for now, we show not found
        // if somehow a user gets here without being logged in.
        return notFound();
    }
    
    return <DistributorDashboardContent distributorId={distributorId} />;
}


export default function DistributorDashboardPage({ params }: { params: Promise<{ distributorId: string }> }) {
  const { distributorId } = use(params);

  return (
    <AuthProvider>
      <DistributorDashboardPageContainer distributorId={distributorId} />
    </AuthProvider>
  );
}
