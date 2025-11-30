
'use client';
import { AppHeader } from '@/components/header';
import { DistributorDashboard } from '@/components/distributor-dashboard';
import { AuthProvider } from '@/hooks/use-auth';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { notFound } from 'next/navigation';
import { use, useMemo } from 'react';

export default function DistributorDashboardPage({ params }: { params: Promise<{ distributorId: string }> }) {
  const { distributorId } = use(params);
  const { allDistributors, loading } = useGenealogyTree();

  const distributor = useMemo(() => {
    return allDistributors?.find(d => d.id === distributorId);
  }, [allDistributors, distributorId]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }
  
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
