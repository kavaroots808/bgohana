'use client';
import { AppHeader } from '@/components/header';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AuthProvider } from '@/hooks/use-auth';

export default function DashboardPage() {
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
