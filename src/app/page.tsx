
'use client';
import { AppHeader } from '@/components/header';
import { GenealogyTree } from '@/components/genealogy-tree';
import { AuthProvider } from '@/hooks/use-auth';

function HomeComponent() {
  // The redirect logic has been removed from here.
  // The homepage will now consistently show the genealogy tree.
  // Logged-in users can navigate to their dashboard via the header.
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
