
'use client';
import { AuthProvider } from '@/hooks/use-auth';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AppHeader } from '@/components/header';

export default function AdminPage() {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <main className="flex-1 overflow-x-auto p-4 md:p-6">
          <AdminDashboard />
        </main>
      </div>
    </AuthProvider>
  );
}
