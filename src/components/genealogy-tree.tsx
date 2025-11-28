'use client';
import type { Distributor } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { FullTreeNode } from './full-tree-node';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {
  const [scale, setScale] = useState(1);

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.2));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetZoom}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="w-full h-full" style={{ viewportOverflow: 'scroll' }}>
          <div className="p-8 w-max">
              <div 
                className='tree transition-transform duration-300'
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
              >
                  <FullTreeNode node={tree} />
              </div>
          </div>
      </ScrollArea>
    </div>
  );
}