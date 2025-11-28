import { AppHeader } from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import { GenealogyTree } from '@/components/genealogy-tree';
import { genealogyTree } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 hidden lg:block border-r">
          <AppSidebar />
        </aside>
        <main className="flex-1 overflow-x-auto">
          <GenealogyTree tree={genealogyTree} />
        </main>
      </div>
    </div>
  );
}
