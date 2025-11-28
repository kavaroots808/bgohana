import { AppHeader } from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import { GenealogyTree } from '@/components/genealogy-tree';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceDashboard } from '@/components/performance-dashboard';
import { LayoutGrid, Network } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 hidden lg:block border-r shrink-0">
          <AppSidebar />
        </aside>
        <main className="flex-1 overflow-x-auto p-4 md:p-6">
          <Tabs defaultValue="tree" className="h-full flex flex-col">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="dashboard">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="tree">
                  <Network className="w-4 h-4 mr-2" />
                  Genealogy
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="dashboard" className="flex-1 overflow-y-auto mt-4">
              <PerformanceDashboard />
            </TabsContent>
            <TabsContent value="tree" className="flex-1 overflow-y-auto">
              <GenealogyTree />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
