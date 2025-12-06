'use client';
import { AppHeader } from '@/components/header';
import { DistributorDashboard } from '@/components/distributor-dashboard';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { notFound, useParams } from 'next/navigation';
import type { Distributor } from '@/lib/types';

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
    
    // For now, only allow a user to see their own dashboard.
    // In a future implementation, you could check if the user is an admin or in the upline.
    if (distributorId !== user.uid) {
      return notFound();
    }
    
    if (!distributor) {
       // This state occurs after auth is loaded, but the distributor profile is not yet available.
       // This can happen for a moment while the profile is being fetched by the useAuth hook.
       return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
    }

    // Now we are sure we are logged in, are viewing our own dashboard, and have the distributor profile.
    return <DistributorDashboardContent distributor={distributor} />;
}


export default function DistributorDashboardPage() {
  return (
    <AuthProvider>
      <DistributorDashboardPageContainer />
    </AuthProvider>
  );
}
