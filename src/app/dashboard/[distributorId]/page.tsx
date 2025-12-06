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

  // This useDoc hook will now correctly fetch the data for ANY distributor,
  // not just the logged in user, assuming the security rules allow it (which they now do).
  const distributorRef = useMemoFirebase(() => {
    if (!firestore || !distributorId) return null;
    return doc(firestore, 'distributors', distributorId);
  }, [firestore, distributorId]);

  const { data: distributor, isLoading } = useDoc<Distributor>(distributorRef);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  if (!distributor) {
    // This will now correctly trigger only if the document truly doesn't exist.
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
        // This should ideally redirect to login, but for now, we show not found
        // if somehow a non-logged-in user gets here. The security rules on the
        // data fetch would also protect the data.
        return notFound();
    }
    
    // Pass the distributorId from params to the content component
    return <DistributorDashboardContent distributorId={distributorId} />;
}


export default function DistributorDashboardPage() {
  return (
    <AuthProvider>
      <DistributorDashboardPageContainer />
    </AuthProvider>
  );
}
