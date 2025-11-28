import type { Distributor } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, TrendingUp, Calendar, UserCheck, Crown, UserPlus, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/client-only';
import { Button } from '@/components/ui/button';

export function DistributorCard({ 
  distributor, 
  isVertical = false,
  onShowDownline
}: { 
  distributor: Distributor, 
  isVertical?: boolean,
  onShowDownline?: () => void 
}) {
  const hasChildren = distributor.children && distributor.children.length > 0;

  return (
    <Card className={cn(
      "shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card",
       isVertical ? "w-full" : "w-72"
    )}>
      <CardHeader className="flex flex-row items-start gap-4 pb-3">
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
        <div className="flex flex-col items-center">
          {distributor.parentId === null && (
            <Crown className="w-6 h-6 text-yellow-500 mb-2" />
          )}
          {hasChildren && onShowDownline && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onShowDownline(); }}>
              <Eye className="w-4 h-4" />
              <span className="sr-only">View Downline</span>
            </Button>
          )}
        </div>
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
