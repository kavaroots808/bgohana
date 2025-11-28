'use client';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import { useState, useRef, WheelEvent, MouseEvent, TouchEvent, useEffect } from 'react';
import { allDistributors, genealogyManager, initialTree } from '@/lib/data';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export function GenealogyTree() {
  const [tree, setTree] = useState<Distributor | null>(initialTree);
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const centerTree = () => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.scrollWidth;
      const initialX = (containerWidth - contentWidth * scale) / 2;
      setPosition({ x: initialX, y: 50 });
    }
  };

  useEffect(() => {
    // Center the tree on initial load
    centerTree();
  }, [tree]); // Recenter if tree data changes

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    genealogyManager.addDistributor(childData, parentId);
    // Re-create the tree structure to trigger a re-render
    const newTree = genealogyManager.buildTreeFromMap();
    setTree(newTree);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (panning) return;
    e.preventDefault();
    const zoomFactor = 0.05;
    const newScale = scale * (1 - e.deltaY * zoomFactor / 100);
    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };
  
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only pan with left mouse button
    e.preventDefault();
    setPanning(true);
    setStartPosition({ x: e.pageX - position.x, y: e.pageY - position.y });
  };
  
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
        setPanning(true);
        setStartPosition({ x: e.touches[0].pageX - position.x, y: e.touches[0].pageY - position.y });
    }
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (panning) {
      setPosition({ x: e.pageX - startPosition.x, y: e.pageY - startPosition.y });
    }
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && panning) {
        setPosition({ x: e.touches[0].pageX - startPosition.x, y: e.touches[0].pageY - startPosition.y });
    }
  };
  
  const onMouseUp = () => {
    setPanning(false);
  };

  const onTouchEnd = () => {
    setPanning(false);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = 0.2;
    const newScale = direction === 'in' ? scale * (1 + zoomFactor) : scale * (1 - zoomFactor);
    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };

  const resetView = () => {
    setScale(1);
    centerTree();
  };

  return (
    <div 
        ref={containerRef}
        className="h-full w-full relative overflow-hidden bg-muted/20 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => handleZoom('in')} aria-label="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleZoom('out')} aria-label="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetView} aria-label="Reset View">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div 
        ref={contentRef}
        className='tree transition-transform duration-100 ease-out'
        style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, 
            transformOrigin: 'top center',
        }}
      >
        <div className="p-8 w-max">
            <FullTreeNode node={tree} onAddChild={handleAddChild} />
        </div>
      </div>
    </div>
  );
}
