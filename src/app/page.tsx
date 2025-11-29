'use client';
import { AppHeader } from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider } from '@/hooks/use-auth';

export default function Home() {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 hidden lg:block border-r shrink-0">
            <AppSidebar />
          </aside>        
          <main className="flex-1 overflow-x-auto main-bg relative">
            <GenealogyTree />
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
