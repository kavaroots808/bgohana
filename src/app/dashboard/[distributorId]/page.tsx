
'use client';
import { use } from 'react';
import { AppHeader } from '@/components/header';
import { DistributorDashboard } from '@/components/distributor-dashboard';
import { AuthProvider } from '@/hooks/use-auth';
import { genealogyManager } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function DistributorDashboardPage({ params }: { params: { distributorId: string } }) {
  const { distributorId } = use(params);
  const distributor = genealogyManager.findNodeById(distributorId);

  if (!distributor) {
    return notFound();
  }

  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <DistributorDashboard distributor={distributor} />
        </main>
      </div>
    </AuthProvider>
  );
}
