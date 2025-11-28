
'use client';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import { useState, useRef, useEffect, WheelEvent, MouseEvent, TouchEvent } from 'react';
import { genealogyManager, initialTree } from '@/lib/data';

export function GenealogyTree() {
  const [tree, setTree] = useState<Distributor | null>(initialTree);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState<number | null>(null);

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
    // Give the browser a moment to render before centering
    setTimeout(centerTree, 0);
  }, [tree]);

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    genealogyManager.addDistributor(childData, parentId);
    const newTree = genealogyManager.buildTreeFromMap();
    setTree(newTree);
  };
  
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
        <div className="p-8">
            <FullTreeNode node={tree} onAddChild={handleAddChild} />
        </div>
      </div>
    </div>
  );
}
