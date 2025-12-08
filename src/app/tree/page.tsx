'use client';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { useAdmin } from '@/hooks/use-admin';
import { useEffect } from 'react';

function TreePageContent() {
  const { user, isUserLoading, distributor } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and there is still no user, they need to log in.
    if (!isUserLoading && !user) {
      router.replace('/');
      return;
    }
    
    // If the user is logged in, but their profile indicates they haven't
    // selected a sponsor yet, redirect them to that step. (Admins are exempt).
    if (user && !isAdmin && distributor && !distributor.sponsorSelected) {
      router.replace('/onboarding/select-sponsor');
    }
  }, [user, isUserLoading, isAdmin, distributor, router]);

  // While checking auth state, show a loading indicator.
  if (isUserLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }

  // If the logic above determined a redirect is needed, this state will be brief.
  // This also handles the case where the user is definitively logged out.
  if (!user) {
     return <div className="h-screen w-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // If user is authenticated, but we're still fetching their specific distributor profile.
  if (!distributor && !isAdmin) {
      return <div className="h-screen w-screen flex items-center justify-center">Loading distributor data...</div>;
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
