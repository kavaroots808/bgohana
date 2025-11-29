'use client';

import { AppHeader } from '@/components/header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RankBadge } from '@/components/rank-badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trees } from 'lucide-react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { genealogyManager } from '@/lib/data';
import Link from 'next/link';

export default function AdminPage() {
  const { tree, loading } = useGenealogyTree();

  if (loading || !tree) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading distributor data...</p>
        </main>
      </div>
    );
  }

  const allDistributors = genealogyManager.allDistributorsList;

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Backend</h1>
            <p className="text-muted-foreground">
              Manage distributors and system settings.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <Trees className="mr-2 h-4 w-4" />
              View Genealogy Tree
            </Link>
          </Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead className="text-right">Downline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDistributors.map((distributor) => (
                <TableRow key={distributor.id}>
                  <TableCell className="font-medium">
                    {distributor.name}
                  </TableCell>
                  <TableCell>
                    <RankBadge rank={distributor.rank} />
                  </TableCell>
                  <TableCell className="text-right">
                    {genealogyManager.getDownline(distributor.id).length}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
