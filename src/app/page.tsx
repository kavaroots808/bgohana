'use client';
import { AppHeader } from '@/components/header';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function HomeComponent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and there is a logged-in user,
    // redirect them to their dashboard.
    if (!loading && user) {
      router.push(`/dashboard/${user.uid}`);
    }
  }, [user, loading, router]);


  // If the user is logged in, show a loading/redirecting message
  // while the useEffect hook redirects them. This avoids flashing the tree.
  if (loading || user) {
    return (
        <div className="flex flex-col h-screen bg-background">
          <AppHeader />
          <div className="flex-1 flex items-center justify-center">
            <p>Loading your dashboard...</p>
          </div>
        </div>
    );
  }

  // Only show the GenealogyTree if the user is not logged in.
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex-1 overflow-x-auto main-bg relative">
        <GenealogyTree />
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <AuthProvider>
      <HomeComponent />
    </AuthProvider>
  );
}
