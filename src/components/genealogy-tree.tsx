'use client';
import type { Distributor } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { FullTreeNode } from './full-tree-node';
import { useState, useRef, WheelEvent, MouseEvent, TouchEvent } from 'react';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startDist, setStartDist] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScale = scale * (1 - e.deltaY / 1000);
    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };
  
  const getDistance = (touches: TouchList) => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  };
  
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setPanning(true);
    setStartPosition({ x: e.pageX - position.x, y: e.pageY - position.y });
  };
  
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
        setStartDist(getDistance(e.touches));
    } else if (e.touches.length === 1) {
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
    if (e.touches.length === 2) {
        const newDist = getDistance(e.touches);
        const newScale = scale * (newDist / startDist);
        setScale(Math.min(Math.max(newScale, 0.1), 3));
        setStartDist(newDist);
    } else if (e.touches.length === 1 && panning) {
        setPosition({ x: e.touches[0].pageX - startPosition.x, y: e.touches[0].pageY - startPosition.y });
    }
  };
  
  const onMouseUp = () => {
    setPanning(false);
  };

  const onTouchEnd = () => {
    setPanning(false);
    setStartDist(0);
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
      <div 
        ref={contentRef}
        className='tree transition-transform duration-100 ease-out'
        style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, 
            transformOrigin: '50% 50%',
        }}
      >
        <div className="p-8 w-max">
            <FullTreeNode node={tree} />
        </div>
      </div>
    </div>
  );
}
