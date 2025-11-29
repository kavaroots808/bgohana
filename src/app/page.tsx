'use client';
import { AppHeader } from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import { GenealogyTree } from '@/components/genealogy-tree';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 hidden lg:block border-r shrink-0">
          <AppSidebar />
        </aside>        
        <main className="flex-1 overflow-x-auto main-bg relative">
          <Button asChild className="absolute top-4 left-4 z-10">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <GenealogyTree />
        </main>
      </div>
    </div>
  );
}
