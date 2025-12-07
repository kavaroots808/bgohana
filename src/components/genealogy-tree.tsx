'use client';
import type { NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { Expand, Shrink, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function GenealogyTree() {
  const { tree, loading, addDistributor } = useGenealogyTree();
  const [expandAll, setExpandAll] = useState<boolean | null>(true);
  const [scale, setScale] = useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'keepSnaps',
    watchDrag: (embla, evt, anscestors) => {
        // Prevent drag on interactive elements
        const isInteractive = anscestors.some(
            (node) => node.hasAttribute('role') || node.tagName === 'BUTTON' || node.tagName === 'A' || node.hasAttribute('data-radix-popper-content-wrapper')
        );
        return !isInteractive;
    }
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const centerTree = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, true);
    }
    // Initial centering logic can be tricky with dynamic content.
    // Embla's default start is usually sufficient.
    setScale(0.8); // Start slightly zoomed out
  }, [emblaApi]);

  useEffect(() => {
    if (!loading && tree && emblaApi) {
      const timer = setTimeout(centerTree, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, tree, emblaApi, centerTree]);
  
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, expandAll, tree]);


  if (loading || !tree) {
    return <p className="text-center text-muted-foreground mt-10">Loading genealogy tree...</p>;
  }

  const handleAddChild = (parentId: string, childData: NewDistributorData) => {
    addDistributor(childData, parentId);
  };

  const handleZoomChange = (newScale: number[]) => {
    setScale(newScale[0]);
  }

  return (
    <div className="h-full w-full relative bg-muted/20">
      <div className="absolute top-4 left-4 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border space-y-3">
        <div className="flex items-center gap-2">
            <ZoomOut className="h-5 w-5" />
            <Slider
                min={0.2}
                max={1.5}
                step={0.01}
                value={[scale]}
                onValueChange={handleZoomChange}
                className="w-32"
            />
            <ZoomIn className="h-5 w-5" />
        </div>
      </div>
      
       <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="outline" size="icon" onClick={() => centerTree()}>
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

      <div className="overflow-hidden h-full w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div 
          className="flex items-center h-full w-full"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        >
          <div
            ref={contentRef}
            className={cn('transition-transform duration-200 ease-out flex')}
            style={{ 
                transform: `scale(${scale})`, 
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
    </div>
  );
}