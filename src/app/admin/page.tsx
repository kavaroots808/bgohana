
'use client';
import { AuthProvider } from '@/hooks/use-auth';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AppHeader } from '@/components/header';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AdminPageContent() {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/tree');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return (
       <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Redirecting...</p>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <AdminDashboard />
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminPageContent />
    </AuthProvider>
  );
}
