'use client';
import { AuthProvider } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Distributor } from '@/lib/types';
import { DistributorList } from '@/components/distributor-list';

function DistributorsPageContent() {
  const { firestore } = useFirebase();
  const distributorsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'distributors') : null),
    [firestore]
  );
  const { data: distributors, isLoading } = useCollection<Distributor>(distributorsQuery);


  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">All Distributors</h1>
        {isLoading ? (
          <p>Loading distributors...</p>
        ) : (
          <DistributorList distributors={distributors || []} />
        )}
      </main>
    </div>
  );
}

export default function DistributorsPage() {
  return (
    <AuthProvider>
      <DistributorsPageContent />
    </AuthProvider>
  );
}
