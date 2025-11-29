
'use client';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { DistributorCard } from './distributor-card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { RankBadge } from './rank-badge';
import { useAuth } from '@/hooks/use-auth';

export const FullTreeNode = ({ node, onAddChild }: { node: Distributor, onAddChild: (parentId: string, childData: NewDistributorData) => void; }) => {
  const { user } = useAuth();
  const hasChildren = node.children && node.children.length > 0;
  const isCurrentUserOrDescendant = genealogyManager.isDescendant(user?.uid ?? '', node.id) || user?.uid === node.id;
  const canViewPopover = user?.uid === node.id;

  return (
    <li>
      <div className='flex justify-center'>
        <Popover>
          <PopoverTrigger asChild disabled={!canViewPopover}>
            <div className={cn('relative group flex flex-col items-center gap-2', canViewPopover && 'cursor-pointer')}>
              <Avatar className={cn(
                "h-16 w-16 border-4 transition-all duration-300",
                node.rank === 'Presidential' ? 'border-yellow-500' :
                node.rank === 'Director' ? 'border-purple-600' :
                node.rank === 'Manager' ? 'border-blue-500' :
                'border-gray-500',
                node.status === 'inactive' && 'opacity-50 grayscale'
              )}>
                <AvatarImage src={node.avatarUrl} alt={node.name} data-ai-hint="person face" />
                <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
              </Avatar>
               <div className='flex flex-col items-center'>
                <p className='text-sm font-medium'>{node.name}</p>
                <RankBadge rank={node.rank} className='text-[10px] px-1.5 py-0' />
               </div>
            </div>
          </PopoverTrigger>
          <PopoverContent 
            side="bottom"
            align="center"
            sideOffset={10}
            className='w-auto p-0 border-none shadow-2xl max-h-[85vh] overflow-y-auto'
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <DistributorCard distributor={node} onAddChild={(childData) => onAddChild(node.id, childData)} />
          </PopoverContent>
        </Popover>
      </div>
      {hasChildren && (
        <ul>
          {node.children.map(child => (
            <FullTreeNode key={child.id} node={child} onAddChild={onAddChild} />
          ))}
        </ul>
      )}
    </li>
  );
};
