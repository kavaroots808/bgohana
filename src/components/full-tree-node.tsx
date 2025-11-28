'use client';
import type { Distributor } from '@/lib/types';
import { DistributorCard } from './distributor-card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { RankBadge } from './rank-badge';

export const FullTreeNode = ({ node, onAddChild }: { node: Distributor, onAddChild: (parentId: string, childName: string) => void; }) => {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <li>
      <div className='flex justify-center'>
        <Popover>
          <PopoverTrigger asChild>
            <div className='relative group cursor-pointer flex flex-col items-center gap-2'>
              {node.parentId === null && (
                <Crown className="w-5 h-5 text-yellow-500 absolute -top-5" />
              )}
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
          <PopoverContent className='w-auto p-0 border-none shadow-2xl'>
            <DistributorCard distributor={node} onAddChild={(childName) => onAddChild(node.id, childName)} />
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
