import { AppHeader } from '@/components/header';
import { allDistributors } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Group Volume</TableHead>
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
                  <TableCell>
                    <Badge
                      variant={
                        distributor.status === 'active'
                          ? 'default'
                          : 'destructive'
                      }
                      className={distributor.status === 'active' ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {distributor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {distributor.groupVolume.toLocaleString()}
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
