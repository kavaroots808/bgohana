import type { Distributor } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, TrendingUp, Calendar, UserCheck, UserPlus, ShoppingCart, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/client-only';
import { RankBadge } from './rank-badge';
import React from 'react';
import { genealogyManager } from '@/lib/data';
import type { CoachingTipsInput } from '@/ai/schemas/coaching-schemas';
import { CoachingTips } from './coaching-tips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CustomerList } from './customer-list';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export function DistributorCard({ 
  distributor
}: { 
  distributor: Distributor, 
}) {
  const nextRank = genealogyManager.getNextRank(distributor.rank);
  const coachingInput: CoachingTipsInput | null = nextRank ? {
    distributor,
    nextRankRequirements: {
      rank: nextRank.rank,
      personalVolume: nextRank.rules.personalVolume,
      groupVolume: nextRank.rules.groupVolume,
    }
  } : { distributor };


  const CardContentDetails = () => (
    <>
      <div className="space-y-2 text-sm text-card-foreground/80">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span>Group Volume: <strong className="text-card-foreground">{distributor.groupVolume.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-accent" />
          <span>Personal Volume: <strong className="text-card-foreground">{distributor.personalVolume.toLocaleString()}</strong></span>
        </div>
        {distributor.generationalVolume.length > 0 && (
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-accent" />
            <div className="flex flex-wrap gap-x-2 items-center">
              <span>Generations:</span>
              {distributor.generationalVolume.map((vol, i) => (
                <span key={i}><strong className="text-card-foreground">{i + 1}:</strong> {vol.toLocaleString()}</span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <span>Recruits: <strong className="text-card-foreground">{distributor.recruits}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-accent" />
          <span>Commissions: <strong className="text-card-foreground">${distributor.commissions.toLocaleString()}</strong></span>
        </div>
        {distributor.canRecruit && (
          <div className="flex items-center gap-2 pt-1 text-green-600">
              <UserPlus className="w-4 h-4" />
              <span>Recruiting eligible</span>
          </div>
        )}
      </div>
       {coachingInput && <CoachingTips input={coachingInput} />}
      <div className="flex justify-between text-xs text-muted-foreground pt-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <ClientOnly>
            <span>Joined: {new Date(distributor.joinDate).toLocaleDateString()}</span>
          </ClientOnly>
        </div>
      </div>
    </>
  );

  return (
    <Card className="w-80 shadow-lg">
       <CardHeader className="flex flex-row items-start gap-4 pb-3">
          <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
              <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{distributor.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant={distributor.status === 'active' ? 'default' : 'destructive'} className={cn(
                "mt-1",
                distributor.status === 'active' ? 'bg-accent text-accent-foreground' : ''
              )}>
                {distributor.status}
              </Badge>
              <RankBadge rank={distributor.rank} className="mt-1" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="details" className="py-4">
              <div className='flex justify-center'>
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="customers">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Customers ({distributor.customers.length})
                    </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="details">
                <CardContentDetails />
              </TabsContent>
              <TabsContent value="customers">
                <CustomerList customers={distributor.customers} />
              </TabsContent>
          </Tabs>
        </CardContent>
    </Card>
  );
}