import type { Distributor } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, TrendingUp, Calendar, UserCheck, MapPin, Crown, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/client-only';

export function DistributorCard({ distributor }: { distributor: Distributor }) {
  return (
    <Card className="w-72 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card">
      <CardHeader className="flex flex-row items-center gap-4 pb-3">
        <Image src={distributor.avatarUrl} alt={distributor.name} width={60} height={60} className="rounded-full border-2 border-primary" data-ai-hint="person face" />
        <div className="flex-1">
          <CardTitle className="text-lg">{distributor.name}</CardTitle>
          <CardDescription>
            <Badge variant={distributor.status === 'active' ? 'default' : 'destructive'} className={cn(
              "mt-1",
              distributor.status === 'active' ? 'bg-accent text-accent-foreground' : ''
            )}>
              {distributor.status}
            </Badge>
          </CardDescription>
        </div>
        {distributor.parentId === null && (
          <Crown className="w-6 h-6 text-yellow-500" />
        )}
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-2 text-sm text-card-foreground/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>Group Volume: <strong className="text-card-foreground">{distributor.groupVolume.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-accent" />
            <span>Personal Volume: <strong className="text-card-foreground">{distributor.personalVolume.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span>Recruits: <strong className="text-card-foreground">{distributor.recruits}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <span>Commissions: <strong className="text-card-foreground">${distributor.commissions.toLocaleString()}</strong></span>
          </div>
          {distributor.placementAllowed && distributor.status === 'active' && (
            <div className="flex items-center gap-2 pt-1 text-green-600">
                <UserPlus className="w-4 h-4" />
                <span>Placement available</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <ClientOnly>
            <span>Joined: {new Date(distributor.joinDate).toLocaleDateString()}</span>
          </ClientOnly>
        </div>
        {distributor.position && (
          <Badge variant="outline">
            {distributor.position}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
