'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trees, X } from 'lucide-react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import Link from 'next/link';
import { DistributorHierarchyRow } from './distributor-hierarchy-row';
import type { Distributor, DistributorRank } from '@/lib/types';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';

const rankOptions: DistributorRank[] = ['LV0', 'LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10', 'LV11', 'LV12'];

export function AdminDashboard() {
  const { allDistributors, loading, tree: originalTree } = useGenealogyTree();
  const [nameFilter, setNameFilter] = useState('');
  const [rankFilter, setRankFilter] = useState<DistributorRank | 'all'>('all');
  const { isAdmin } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);


  const filteredTree = useMemo(() => {
    if (!allDistributors || !originalTree) return null;

    if (!nameFilter && rankFilter === 'all') {
      return originalTree;
    }

    const lowerCaseNameFilter = nameFilter.toLowerCase();
    
    // First, filter the flat list of distributors
    const filteredDistributorsList = allDistributors.filter(d => {
      const nameMatch = d.name.toLowerCase().includes(lowerCaseNameFilter);
      const rankMatch = rankFilter === 'all' || d.rank === rankFilter;
      return nameMatch && rankMatch;
    });

    if (filteredDistributorsList.length === 0) {
      return null;
    }

    // Rebuild the tree from the filtered list
    const distributorsMap = new Map<string, Distributor>();
    filteredDistributorsList.forEach(d => {
        distributorsMap.set(d.id, { ...d, children: [] });
    });

    let root: Distributor | null = null;
    const allNodes = Array.from(distributorsMap.values());
    
    // Find the highest-level node in the filtered set to act as the root
    let potentialRoots = allNodes.filter(node => !node.parentId || !distributorsMap.has(node.parentId));
    
    // Prefer the original root if it's in the list
    const originalRootInFiltered = potentialRoots.find(r => r.id === originalTree.id);
    root = originalRootInFiltered || potentialRoots[0] || null;

    if (!root) return null; // Should not happen if list is not empty

    allNodes.forEach(distributor => {
        if (distributor.id === root?.id) return;
        const parent = distributorsMap.get(distributor.parentId!);
        if (parent) {
            parent.children.push(distributor);
            parent.children.sort((a,b) => a.name.localeCompare(b.name));
        }
    });

    return root;

  }, [allDistributors, originalTree, nameFilter, rankFilter]);

  if (loading || !originalTree || !isAdmin) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <p>Loading distributor data...</p>
        </main>
      </div>
    );
  }

  const isFiltering = nameFilter !== '' || rankFilter !== 'all';
  const clearFilters = () => {
    setNameFilter('');
    setRankFilter('all');
  };

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
      <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 border rounded-lg bg-card">
        <Input 
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={rankFilter} onValueChange={(value) => setRankFilter(value as DistributorRank | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by rank..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            {rankOptions.map(rank => (
              <SelectItem key={rank} value={rank}>{rank}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltering && (
            <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
            </Button>
        )}
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
            {filteredTree ? (
              <DistributorHierarchyRow distributor={filteredTree} level={0} />
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No distributors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
