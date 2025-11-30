
'use client';
import { AppHeader } from '@/components/header';
import { PerformanceDashboard } from '@/components/performance-dashboard';
import { AuthProvider } from '@/hooks/use-auth';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-4">Organization-Wide Dashboard</h1>
          <PerformanceDashboard />
        </main>
      </div>
    </AuthProvider>
  );
}
