
'use client';
import type { Customer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { ClientOnly } from './client-only';
import { ShoppingBag, Calendar } from 'lucide-react';

export function CustomerList({ customers }: { customers: Customer[] }) {

  if (!customers || customers.length === 0) {
    return <p className="text-center text-muted-foreground pt-8">This distributor has no customers.</p>;
  }

  return (
    <div className="space-y-4 pt-4">
      {customers.map(customer => (
        <Card key={customer.id} className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={customer.avatarUrl} alt={customer.name} data-ai-hint="person face" />
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-accent" />
                <span>Total Volume: <strong className="text-foreground">${customer.totalPurchases.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <ClientOnly>
                    <span>Joined: {new Date(customer.joinDate).toLocaleDateString()}</span>
                </ClientOnly>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
