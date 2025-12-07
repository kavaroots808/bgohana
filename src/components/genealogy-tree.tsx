
'use client';
import type { NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { Expand, Shrink, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function GenealogyTree() {
  const { tree, loading, addDistributor } = useGenealogyTree();
  const [expandAll, setExpandAll] = useState<boolean | null>(true);
  const [scale, setScale] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // State for touch gesture handling
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState(0);

  const centerTree = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setScale(0.8);
  }, []);

  useEffect(() => {
    if (!loading && tree) {
      const timer = setTimeout(centerTree, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, tree, centerTree]);

  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    addDistributor(childData, parentId);
  };
  
  const handleZoomChange = (newScale: number[]) => {
    setScale(newScale[0]);
  };
  
  // --- Mouse Wheel Zoom ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.005;
    setScale(s => Math.min(Math.max(0.2, s + delta), 2));
  };
  
  // --- Touch Gestures ---
  const getDistance = (touches: React.TouchList) => {
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent gesture if target is interactive
    const target = e.target as HTMLElement;
    if (target.closest('[role="button"], button, a, [data-radix-popper-content-wrapper]')) {
        return;
    }
    
    if (e.touches.length === 1) {
        setIsPanning(true);
        setStartPan({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
        setLastDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        setPan({
            x: e.touches[0].clientX - startPan.x,
            y: e.touches[0].clientY - startPan.y,
        });
    } else if (e.touches.length === 2) {
        e.preventDefault();
        const newDist = getDistance(e.touches);
        const scaleChange = newDist / lastDistance;
        
        setScale(s => Math.min(Math.max(0.2, s * scaleChange), 2));
        setLastDistance(newDist);
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setLastDistance(0);
  };


  if (loading || !tree) {
    return <p className="text-center text-muted-foreground mt-10">Loading genealogy tree...</p>;
  }

  return (
    <div className="h-full w-full relative bg-muted/20">
       <div className="absolute top-4 left-4 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border space-y-3">
        <div className="flex items-center gap-2">
            <ZoomOut className="h-5 w-5" />
            <Slider
                min={0.2}
                max={2}
                step={0.01}
                value={[scale]}
                onValueChange={handleZoomChange}
                className="w-32"
            />
            <ZoomIn className="h-5 w-5" />
        </div>
      </div>
      
       <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="outline" size="icon" onClick={centerTree}>
                <LocateFixed className="h-4 w-4" />
                <span className="sr-only">Center Tree</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setExpandAll(true)}>
                <Expand className="h-4 w-4" />
                 <span className="sr-only">Expand All</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setExpandAll(false)}>
                <Shrink className="h-4 w-4" />
                 <span className="sr-only">Collapse All</span>
            </Button>
       </div>

      <div 
        ref={viewportRef}
        className="overflow-hidden h-full w-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className={cn('transition-transform duration-200 ease-out flex')}
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, 
            transformOrigin: 'center',
          }}
        >
          <div 
            className='tree'
            style={{ 
                padding: '50px',
                minWidth: 'max-content',
            }}
          >
            <ul>
              <FullTreeNode key={tree.id} node={tree} onAddChild={handleAddChild} expandAll={expandAll} isRoot={true} />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
