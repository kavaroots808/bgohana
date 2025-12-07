'use client';
import type { NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { Expand, Shrink, LocateFixed } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function GenealogyTree() {
  const { tree, loading, addDistributor } = useGenealogyTree();
  const [expandAll, setExpandAll] = useState<boolean | null>(true);

  const scaleRef = useRef(0.8);
  const panRef = useRef({ x: 0, y: 0 });
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const lastDistanceRef = useRef(0);

  const updateTransform = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${scaleRef.current})`;
    }
  }, []);

  const centerTree = useCallback(() => {
    panRef.current = { x: 0, y: 0 };
    scaleRef.current = 0.8;
    updateTransform();
  }, [updateTransform]);

  useEffect(() => {
    if (!loading && tree) {
      const timer = setTimeout(centerTree, 100); // Center after initial render
      return () => clearTimeout(timer);
    }
  }, [loading, tree, centerTree]);

  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    addDistributor(childData, parentId);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.005;
    scaleRef.current = Math.min(Math.max(0.2, scaleRef.current + delta), 2);
    updateTransform();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.group') || !viewportRef.current) return;
    
    e.preventDefault();
    isPanningRef.current = true;
    startPanRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    viewportRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    e.preventDefault();
    panRef.current = {
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y,
    };
    updateTransform();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    isPanningRef.current = false;
    if(viewportRef.current) {
      viewportRef.current.style.cursor = 'grab';
    }
  };

  const getDistance = (touches: React.TouchList) => {
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[role="button"], button, a, [data-radix-popper-content-wrapper], .group')) {
        return;
    }
    
    if (e.touches.length === 1) {
      isPanningRef.current = true;
      startPanRef.current = { x: e.touches[0].clientX - panRef.current.x, y: e.touches[0].clientY - panRef.current.y };
    } else if (e.touches.length === 2) {
      e.preventDefault(); // Prevent default browser zoom
      isPanningRef.current = false; 
      lastDistanceRef.current = getDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanningRef.current) {
      e.preventDefault(); // Prevent page scroll while panning
      panRef.current = {
        x: e.touches[0].clientX - startPanRef.current.x,
        y: e.touches[0].clientY - startPanRef.current.y,
      };
      updateTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault(); // Prevent default browser zoom
      const newDist = getDistance(e.touches);
      const scaleChange = newDist / lastDistanceRef.current;
      
      scaleRef.current = Math.min(Math.max(0.2, scaleRef.current * scaleChange), 2);
      lastDistanceRef.current = newDist;
      updateTransform();
    }
  };

  const handleTouchEnd = () => {
    isPanningRef.current = false;
    lastDistanceRef.current = 0;
  };


  if (loading || !tree) {
    return <p className="text-center text-muted-foreground mt-10">Loading genealogy tree...</p>;
  }

  return (
    <div className="h-full w-full relative bg-muted/20">
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
        className="overflow-hidden h-full w-full cursor-grab"
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop panning if mouse leaves the area
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className={cn('transition-transform duration-200 ease-out flex')}
          style={{ 
            transformOrigin: 'center',
            // Initial transform is set by useEffect -> updateTransform
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
