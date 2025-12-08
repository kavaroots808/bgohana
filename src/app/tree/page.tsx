
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
    // If auth has loaded and there is no user, redirect to the login page.
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  // Handle the case where a new user signs up and needs to select a sponsor.
  // This check is more reliable than the previous implementation.
  useEffect(() => {
    if (distributor && !distributor.sponsorSelected) {
       router.replace('/onboarding/select-sponsor');
    }
  }, [distributor, router]);


  // Show a loading screen while auth is being checked.
  if (isUserLoading || !user || !distributor) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }
  
  // If the user needs to select a sponsor, show a redirecting message.
  if (!distributor.sponsorSelected) {
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
