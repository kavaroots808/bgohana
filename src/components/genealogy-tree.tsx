
'use client';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { FullTreeNode } from './full-tree-node';
import { useState, useRef, useEffect } from 'react';
import { genealogyManager, initialTree } from '@/lib/data';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export function GenealogyTree() {
  const [tree, setTree] = useState<Distributor | null>(initialTree);
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const centerTree = () => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.scrollWidth;
      
      containerRef.current.scrollLeft = (contentWidth * scale - containerWidth) / 2;
    }
  };

  useEffect(() => {
    centerTree();
  }, [scale]); 
  
  useEffect(() => {
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
  
  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = 0.2;
    const newScale = direction === 'in' ? scale * (1 + zoomFactor) : scale * (1 - zoomFactor);
    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };

  const resetView = () => {
    setScale(1);
    setTimeout(centerTree, 0);
  };

  return (
    <div 
        ref={containerRef}
        className="h-full w-full relative overflow-auto bg-muted/20"
    >
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
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
        className='tree'
        style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
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
