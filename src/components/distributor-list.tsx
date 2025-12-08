'use client';
import type { Distributor } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RankBadge } from './rank-badge';
import Link from 'next/link';
import { Button } from './ui/button';
import { LayoutDashboard } from 'lucide-react';

export function DistributorList({ distributors }: { distributors: Distributor[] }) {
  if (!distributors || distributors.length === 0) {
    return <p className="text-center text-muted-foreground pt-8">No distributors found.</p>;
  }

  // Sort distributors alphabetically by name
  const sortedDistributors = [...distributors].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedDistributors.map(distributor => (
        <Card key={distributor.id}>
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
              <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{distributor.name}</p>
              <p className="text-sm text-muted-foreground">{distributor.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <RankBadge rank={distributor.rank} />
                 <Button variant="outline" size="sm" asChild className="h-7">
                  <Link href={`/dashboard/${distributor.id}`}>
                    <LayoutDashboard className="mr-1 h-3 w-3" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
