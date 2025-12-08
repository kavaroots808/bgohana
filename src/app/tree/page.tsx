
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
    // If auth has loaded and there is NO user, redirect to the login page.
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  // A new user might need to select a sponsor, but that logic should be handled
  // when they sign up or on a dedicated onboarding page, not here.
  // The logic that was here was causing a redirect loop.
  // We check for the sponsorSelected flag on the user's initial onboarding flow instead.

  // A user who signs up via the normal `/signup` route will be redirected to
  // `/onboarding/select-sponsor` immediately after signup by the `useAuth` hook.
  // That is the correct place to handle that logic. This page should just show the tree.

  // Show a loading screen while auth is being checked or the distributor profile is loading.
  if (isUserLoading || !user || !distributor) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading genealogy tree...</div>;
  }
  
  // This is a safeguard. If a user somehow lands here without selecting a sponsor,
  // (e.g., old user, broken signup flow), send them to the sponsor selection page.
  // This is less disruptive than the previous implementation.
  if (!distributor.sponsorSelected) {
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
