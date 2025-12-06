'use client';
import { AppHeader } from '@/components/header';
import { DistributorDashboard } from '@/components/distributor-dashboard';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { notFound, useParams } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


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


function DistributorDashboardPageContainer() {
    const params = useParams();
    const distributorId = params.distributorId as string;
    const { loading: isAuthLoading, user } = useAuth();

    if (isAuthLoading) {
        return <div className="flex h-screen items-center justify-center">Authenticating...</div>;
    }

    if (!user) {
        // If a non-logged-in user gets here, the security rules on the data fetch
        // will protect the data, but we can show a more explicit message or redirect.
        // For now, notFound() is safe.
        return notFound();
    }
    
    return <DistributorDashboardContent distributorId={distributorId} />;
}


export default function DistributorDashboardPage() {
  return (
    <AuthProvider>
      <DistributorDashboardPageContainer />
    </AuthProvider>
  );
}
