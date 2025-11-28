import { AppHeader } from '@/components/header';
import { allDistributors, genealogyManager } from '@/lib/data';
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
import { MoreHorizontal } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Admin Backend</h1>
          <p className="text-muted-foreground">
            Manage distributors and system settings.
          </p>
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
