
'use client';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Distributor } from '@/lib/types';
import { DistributorList } from '@/components/distributor-list';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function DistributorsPageContent() {
  const { user, isUserLoading } = useAuth();
  const { firestore } = useFirebase();

  const distributorsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'distributors') : null),
    [firestore]
  );
  
  const { data: distributors, isLoading: distributorsLoading } = useCollection<Distributor>(distributorsQuery);

  const isLoading = isUserLoading || distributorsLoading;

  const DistributorSkeleton = () => (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">All Distributors</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <DistributorSkeleton key={i} />)}
          </div>
        ) : !user ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Please <Link href="/" className="underline text-primary">sign in</Link> to view distributors.</p>
          </div>
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
