'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trees } from 'lucide-react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import Link from 'next/link';
import { DistributorHierarchyRow } from './distributor-hierarchy-row';


export function AdminDashboard() {
  const { tree, loading } = useGenealogyTree();

  if (loading || !tree) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <p>Loading distributor data...</p>
        </main>
      </div>
    );
  }

  return (
    <>
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
            <DistributorHierarchyRow distributor={tree} level={0} />
          </TableBody>
        </Table>
      </div>
    </>
  );
}
