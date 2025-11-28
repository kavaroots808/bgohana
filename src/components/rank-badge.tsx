import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DistributorRank } from '@/lib/types';
import { Star, Shield, Trophy, Diamond } from 'lucide-react';

const rankConfig: Record<DistributorRank, { icon: React.ElementType, className: string }> = {
    'Distributor': { icon: Star, className: 'bg-gray-500 hover:bg-gray-500/90' },
    'Manager': { icon: Shield, className: 'bg-blue-500 hover:bg-blue-500/90' },
    'Director': { icon: Trophy, className: 'bg-purple-600 hover:bg-purple-600/90' },
    'Presidential': { icon: Diamond, className: 'bg-yellow-500 text-yellow-900 hover:bg-yellow-500/90' },
};

export function RankBadge({ rank, className }: { rank: DistributorRank, className?: string }) {
    const { icon: Icon, className: rankClassName } = rankConfig[rank];

    return (
        <Badge className={cn('flex items-center gap-1.5 text-primary-foreground', rankClassName, className)}>
            <Icon className="w-3.5 h-3.5" />
            <span>{rank}</span>
        </Badge>
    )
}
