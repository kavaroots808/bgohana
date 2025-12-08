
'use client';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useEffect } from 'react';

function TreePageContent() {
  const { user, isUserLoading, distributor } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }

  // If user is authenticated, but we're still fetching their specific distributor profile.
  // This can also cover the onboarding case, as distributor profile will be null initially for new signups.
  if (!distributor) {
      return <div className="h-screen w-screen flex items-center justify-center">Loading distributor data...</div>;
  }
  
  // A new user signing up will have sponsorSelected: false.
  // This is the ONLY place that should handle this redirect.
  if (distributor && !distributor.sponsorSelected) {
    router.replace('/onboarding/select-sponsor');
    return <div className="h-screen w-screen flex items-center justify-center">Redirecting to sponsor selection...</div>;
  }
  
  // If we've passed all checks, render the main application content.
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 relative">
        <GenealogyTree />
      </main>
    </div>
  );
}


export default function TreePage() {
  return (
    <AuthProvider>
        <TreePageContent />
    </AuthProvider>
  );
}
