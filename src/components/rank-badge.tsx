import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DistributorRank } from '@/lib/types';
import { Star, Shield, Trophy, Diamond, Award, Crown, Medal, Gem } from 'lucide-react';

const rankConfig: Record<DistributorRank, { icon: React.ElementType, className: string }> = {
    'Level 0': { icon: Star, className: 'bg-gray-400 hover:bg-gray-400/90' },
    'Level 1': { icon: Shield, className: 'bg-green-500 hover:bg-green-500/90' },
    'Level 2': { icon: Award, className: 'bg-blue-500 hover:bg-blue-500/90' },
    'Level 3': { icon: Medal, className: 'bg-indigo-500 hover:bg-indigo-500/90' },
    'Level 4': { icon: Trophy, className: 'bg-purple-600 hover:bg-purple-600/90' },
    'Level 5': { icon: Gem, className: 'bg-pink-600 hover:bg-pink-600/90' },
    'Level 6': { icon: Diamond, className: 'bg-yellow-500 text-yellow-900 hover:bg-yellow-500/90' },
    'Level 7': { icon: Star, className: 'bg-teal-500 hover:bg-teal-500/90' },
    'Level 8': { icon: Shield, className: 'bg-cyan-500 hover:bg-cyan-500/90' },
    'Level 9': { icon: Award, className: 'bg-red-500 hover:bg-red-500/90' },
    'Level 10': { icon: Medal, className: 'bg-orange-500 hover:bg-orange-500/90' },
    'Level 11': { icon: Trophy, className: 'bg-lime-500 hover:bg-lime-500/90' },
    'Level 12': { icon: Crown, className: 'bg-rose-500 hover:bg-rose-500/90' },
};

export function RankBadge({ rank, className }: { rank: DistributorRank, className?: string }) {
    const config = rankConfig[rank] ?? rankConfig['Level 0'];
    const { icon: Icon, className: rankClassName } = config;

    return (
        <Badge className={cn('flex items-center gap-1.5 text-primary-foreground', rankClassName, className)}>
            <Icon className="w-3.5 h-3.5" />
            <span>{rank}</span>
        </Badge>
    )
}
