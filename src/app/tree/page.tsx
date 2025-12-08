
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
    // This is the only redirection this page should be responsible for.
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  // Show a loading screen while auth is being checked.
  if (isUserLoading || !user) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }
  
  // A safeguard for the brief moment the distributor object is loading after auth is confirmed.
  if (!distributor) {
     return <div className="h-screen w-screen flex items-center justify-center">Loading profile...</div>;
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
