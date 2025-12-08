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
    // Redirect non-admins trying to access the root page without having selected a sponsor yet
    if (!isUserLoading && user && !isAdmin && distributor && !distributor.sponsorSelected) {
      router.push('/onboarding/select-sponsor');
    }
  }, [user, isUserLoading, isAdmin, distributor, router]);

  // If auth is loading, show a generic loading screen.
  if (isUserLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }

  // If there's no user, redirect to login.
  if (!user) {
    router.push('/login');
    return <div className="h-screen w-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // If user data is available but the distributor profile isn't loaded yet
  if (!distributor && !isAdmin) {
      return <div className="h-screen w-screen flex items-center justify-center">Loading distributor data...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 relative">
        <GenealogyTree />
      </main>
    </div>
  );
}


export default function Home() {
  return (
    <AuthProvider>
        <TreePageContent />
    </AuthProvider>
  );
}
