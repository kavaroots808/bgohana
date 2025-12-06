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
import { ChevronDown, Expand, Shrink, MousePointer, ZoomIn } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export function GenealogyTree() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { tree, loading, addDistributor } = useGenealogyTree();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const [isRootExpanded, setIsRootExpanded] = useState(true);
  const [expandAll, setExpandAll] = useState<boolean | null>(true);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const centerTree = () => {
    if (viewportRef.current && contentRef.current) {
      const containerWidth = viewportRef.current.offsetWidth;
      const containerHeight = viewportRef.current.offsetHeight;
      
      // Temporarily set scale to 1 to measure natural size
      contentRef.current.style.transform = 'scale(1)';
      const contentWidth = contentRef.current.scrollWidth;
      const contentHeight = contentRef.current.scrollHeight;
      
      const initialPanX = (containerWidth - contentWidth) / 2;
      const initialPanY = 50; // A fixed top margin
      
      setPan({ x: initialPanX, y: initialPanY });
      // Reset transform so it can be controlled by state
      contentRef.current.style.transform = `translate(${initialPanX}px, ${initialPanY}px) scale(${scale})`;
    }
  };

  useEffect(() => {
    if (!loading && tree) {
        const timer = setTimeout(centerTree, 100);
        return () => clearTimeout(timer);
    }
  }, [loading, tree]);

  useEffect(() => {
    setIsRootExpanded(!!expandAll);
  }, [expandAll]);

  if (loading || !tree) {
    return <p className="text-center text-muted-foreground mt-10">Loading genealogy tree...</p>;
  }
  
  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    addDistributor(childData, parentId);
    if (!isRootExpanded) {
      setIsRootExpanded(true);
    }
  };
  
  const isCurrentUser = user?.uid === tree.id;
  const canViewPopover = isCurrentUser || isAdmin;

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const newScale = e.deltaY < 0 ? scale * (1 + zoomFactor) : scale * (1 - zoomFactor);
    const clampedScale = Math.min(Math.max(newScale, 0.1), 3);

    const rect = viewportRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - pan.x) * (clampedScale / scale);
    const newY = mouseY - (mouseY - pan.y) * (clampedScale / scale);
    
    setScale(clampedScale);
    setPan({ x: newX, y: newY });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Only start panning if the click is on the background, not on interactive elements.
    if ((e.target as HTMLElement).closest('.tree, button, [role="button"], [aria-haspopup="dialog"]')) {
      return;
    }
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
    const [touch1, touch2] = Array.from(touches);
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
     if ((e.target as HTMLElement).closest('.tree, button, [role="button"], [aria-haspopup="dialog"]')) {
      return;
    }
    e.preventDefault();
    if (e.touches.length === 1) {
        setIsPanning(true);
        setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
        setLastDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        setPan({
            x: e.touches[0].clientX - startPan.x,
            y: e.touches[0].clientY - startPan.y,
        });
    } else if (e.touches.length === 2 && lastDistance) {
        e.preventDefault();
        const newDistance = getDistance(e.touches);
        const scaleChange = newDistance / lastDistance;
        const newScale = Math.min(Math.max(scale * scaleChange, 0.1), 3);

        const rect = viewportRef.current!.getBoundingClientRect();
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
        ref={viewportRef}
        className="h-full w-full relative overflow-hidden bg-muted/20 cursor-grab active:cursor-grabbing"
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
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-[calc(100%-2rem)] sm:max-w-md">
         <Alert className="flex items-center justify-between p-2 sm:p-4">
           <div className="hidden sm:block">
            <AlertTitle className="flex items-center">
              Navigation
            </AlertTitle>
            <AlertDescription className="text-xs space-y-1 mt-2">
              <div className="flex items-center gap-2"><MousePointer className="h-3 w-3" /> <strong>Pan:</strong> Click & Drag</div>
              <div className="flex items-center gap-2"><ZoomIn className="h-3 w-3" /> <strong>Zoom:</strong> Scroll / Pinch</div>
            </AlertDescription>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-7 sm:w-7" onClick={() => setExpandAll(true)}>
                  <Expand className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-7 sm:w-7" onClick={() => setExpandAll(false)}>
                  <Shrink className="h-4 w-4" />
              </Button>
           </div>
         </Alert>
       </div>

      <div
        ref={contentRef}
        style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, 
            transformOrigin: 'top left',
            width: 'max-content',
        }}
      >
        <div 
          className='tree'
          style={{ 
              padding: '20px',
              minWidth: '100vw'
          }}
        >
          <ul>
            <li className="pt-0">
              <div className='flex flex-col items-center'>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className={cn('relative group flex flex-col items-center gap-2', canViewPopover && 'cursor-pointer')} aria-haspopup="dialog">
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
                    <FullTreeNode key={child.id} node={child} onAddChild={handleAddChild} expandAll={expandAll} />
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

    