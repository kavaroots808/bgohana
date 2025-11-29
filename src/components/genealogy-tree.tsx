
'use client';
import type { NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import { useState, useRef, useEffect, WheelEvent, MouseEvent, TouchEvent } from 'react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { useAuth } from '@/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { RankBadge } from './rank-badge';
import { DistributorCard } from './distributor-card';
import { ChevronDown } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';

export function GenealogyTree() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { tree, loading, addDistributor } = useGenealogyTree(user?.uid);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const [isRootExpanded, setIsRootExpanded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const centerTree = () => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.scrollWidth;
      const initialPanX = (containerWidth - contentWidth * scale) / 2;
      setPan({ x: initialPanX, y: 50 });
    }
  };

  useEffect(() => {
    if (!loading) {
        setTimeout(centerTree, 0);
    }
  }, [loading, tree]);

  if (loading || !tree) {
    return <p className="text-center text-muted-foreground mt-10">Generating genealogy tree...</p>;
  }
  
  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    addDistributor(childData, parentId);
  };
  
  const isCurrentUser = user?.uid === tree.id;
  const canViewPopover = isCurrentUser || isAdmin;

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const newScale = e.deltaY < 0 ? scale * (1 + zoomFactor) : scale * (1 - zoomFactor);
    const clampedScale = Math.min(Math.max(newScale, 0.1), 3);

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - pan.x) * (clampedScale / scale);
    const newY = mouseY - (mouseY - pan.y) * (clampedScale / scale);
    
    setScale(clampedScale);
    setPan({ x: newX, y: newY });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const getDistance = (touches: TouchList) => {
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        setIsPanning(true);
        setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
        setLastDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
        setPan({
            x: e.touches[0].clientX - startPan.x,
            y: e.touches[0].clientY - startPan.y,
        });
    } else if (e.touches.length === 2 && lastDistance) {
        const newDistance = getDistance(e.touches);
        const scaleChange = newDistance / lastDistance;
        const newScale = Math.min(Math.max(scale * scaleChange, 0.1), 3);

        const rect = containerRef.current!.getBoundingClientRect();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
        const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;

        const newX = centerX - (centerX - pan.x) * (newScale / scale);
        const newY = centerY - (centerY - pan.y) * (newScale / scale);

        setScale(newScale);
        setPan({x: newX, y: newY });
        setLastDistance(newDistance);
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      setLastDistance(null);
    }
    if (e.touches.length < 1) {
      setIsPanning(false);
    }
  };


  return (
    <div 
        ref={containerRef}
        className="h-full w-full relative overflow-hidden bg-muted/20 cursor-grab"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
    >
      <div 
        ref={contentRef}
        className='tree'
        style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, 
            transformOrigin: '0 0',
            width: 'max-content',
            minWidth: '100%'
        }}
      >
        <ul>
          <li className="pt-0">
            <div className='flex flex-col items-center'>
              <Popover>
                <PopoverTrigger asChild>
                  <div className={cn('relative group flex flex-col items-center gap-2', canViewPopover && 'cursor-pointer')}>
                    <Avatar className={cn(
                      "h-16 w-16 border-4 transition-all duration-300",
                      tree.rank === 'Presidential' ? 'border-yellow-500' :
                      tree.rank === 'Director' ? 'border-purple-600' :
                      tree.rank === 'Manager' ? 'border-blue-500' :
                      'border-gray-500',
                      tree.status === 'inactive' && 'opacity-50 grayscale'
                    )}>
                      <AvatarImage src={tree.avatarUrl} alt={tree.name} data-ai-hint="person face" />
                      <AvatarFallback>{tree.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-center'>
                      <p className='text-sm font-medium'>{tree.name}</p>
                      <RankBadge rank={tree.rank} className='text-[10px] px-1.5 py-0' />
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
                  <DistributorCard distributor={tree} onAddChild={(childData) => handleAddChild(tree.id, childData)} />
                </PopoverContent>
              </Popover>
              {tree.children && tree.children.length > 0 && (
                <button onClick={() => setIsRootExpanded(!isRootExpanded)} className="toggle-children">
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isRootExpanded && "rotate-180")} />
                </button>
              )}
            </div>
            {tree.children && tree.children.length > 0 && isRootExpanded && (
              <ul>
                {tree.children.map(child => (
                  <FullTreeNode key={child.id} node={child} onAddChild={handleAddChild} />
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
