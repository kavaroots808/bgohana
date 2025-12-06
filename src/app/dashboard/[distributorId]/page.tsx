'use client';
import { AppHeader } from '@/components/header';
import { DistributorDashboard } from '@/components/distributor-dashboard';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { notFound, useParams } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


function DistributorDashboardContent({ distributor }: { distributor: Distributor }) {
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
    const { isUserLoading, user, distributor } = useAuth();

    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center">Authenticating...</div>;
    }

    if (!user) {
        // This should not happen if routes are protected, but as a safeguard.
        return notFound();
    }
    
    // The distributor object from the auth context corresponds to the logged-in user.
    // We must verify that the dashboard being requested belongs to the logged-in user.
    // Or in a future implementation, check if the user has permission to view it (e.g. admin, upline).
    if (distributorId !== user.uid) {
      // For now, only allow users to see their own dashboard.
      // You could redirect or show an "Unauthorized" message here.
      return notFound();
    }
    
    if (!distributor) {
       // This state occurs after auth is loaded, but the distributor profile is not yet available.
       return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
    }

    return <DistributorDashboardContent distributor={distributor} />;
}


export default function DistributorDashboardPage() {
  return (
    <AuthProvider>
      <DistributorDashboardPageContainer />
    </AuthProvider>
  );
}

    