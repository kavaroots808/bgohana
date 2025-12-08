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
    // If auth is done and there's no user, go to login.
    if (!isUserLoading && !user) {
      router.replace('/');
      return;
    }
    
    // Redirect non-admins trying to access the root page without having selected a sponsor yet
    if (!isUserLoading && user && !isAdmin && distributor && !distributor.sponsorSelected) {
      router.replace('/onboarding/select-sponsor');
    }
  }, [user, isUserLoading, isAdmin, distributor, router]);

  // If auth is loading, show a generic loading screen.
  if (isUserLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }

  // This case can happen for a brief moment if the user is logged in, but their profile isn't loaded yet.
  if (!user && !isUserLoading) {
    // This state is temporary, the useEffect above will redirect.
     return <div className="h-screen w-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // If user data is available but the distributor profile isn't loaded yet (and not an admin)
  if (user && !distributor && !isAdmin) {
      return <div className="h-screen w-screen flex items-center justify-center">Loading distributor data...</div>;
  }
  
  // If we are still here, it's safe to render the tree for either an admin or a valid distributor.
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
