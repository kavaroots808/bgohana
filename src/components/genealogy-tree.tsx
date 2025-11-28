'use client';
import { useState } from 'react';
import type { Distributor } from '@/lib/types';
import { TreeNode } from './tree-node';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronRight, Home } from 'lucide-react';
import { genealogyManager } from '@/lib/data';
import { DistributorCard } from './distributor-card';
import { ScrollArea } from './ui/scroll-area';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {
  const [focalNode, setFocalNode] = useState<Distributor | null>(tree);
  const [history, setHistory] = useState<Distributor[]>(tree ? [tree] : []);

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  const handleNodeSelect = (node: Distributor) => {
    setFocalNode(node);
    const newHistory = [];
    let currentNode: Distributor | undefined = node;
    while(currentNode) {
      newHistory.unshift(currentNode);
      currentNode = genealogyManager.findNodeById(currentNode.parentId!);
    }
    const rootNode = genealogyManager.root;
    if (rootNode && newHistory.length > 0 && newHistory[0].id !== rootNode.id) {
       newHistory.unshift(rootNode);
    }
    setHistory(newHistory);
  };

  const handleBreadcrumbClick = (nodeId: string) => {
    const node = genealogyManager.findNodeById(nodeId);
    if(node) {
      const nodeIndex = history.findIndex(h => h.id === nodeId);
      setFocalNode(node);
      setHistory(history.slice(0, nodeIndex + 1));
    }
  }
  
  const currentChildren = focalNode?.children || [];

  return (
    <div className="h-full w-full flex flex-col">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 px-4 md:px-8 overflow-x-auto whitespace-nowrap">
        <Home className="w-4 h-4 shrink-0" />
        {history.map((node, index) => (
          <div key={node.id} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 shrink-0" />
            <button 
              onClick={() => handleBreadcrumbClick(node.id)} 
              className={`hover:text-primary truncate ${focalNode?.id === node.id ? 'text-primary font-semibold' : ''}`}
            >
              {node.name}
            </button>
          </div>
        ))}
      </div>
      
      {/* Horizontal tree for medium screens and up */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1">
        {focalNode && (
          <div className="mb-8">
            <TreeNode node={focalNode} onNodeSelect={(node) => (node.children && node.children.length > 0) ? handleNodeSelect(node) : undefined} isFocal={true} />
          </div>
        )}
        {currentChildren.length > 0 ? (
          <Carousel opts={{ align: "start" }} className="w-full max-w-5xl">
            <CarouselContent className="-ml-4">
              {currentChildren.map((childNode) => (
                <CarouselItem key={childNode.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <TreeNode node={childNode} onNodeSelect={handleNodeSelect} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-12" />
            <CarouselNext className="mr-12" />
          </Carousel>
        ) : (
          focalNode && <p className="text-muted-foreground mt-4">This distributor has no downline.</p>
        )}
      </div>

      {/* Vertical list for small screens */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        {focalNode && (
          <div className="px-4 pb-4">
             <DistributorCard distributor={focalNode} isVertical={true} onShowDownline={() => {}}/>
          </div>
        )}
        <p className="px-4 text-sm font-semibold text-muted-foreground mb-2">
            Downline ({currentChildren.length})
        </p>
        <ScrollArea className="flex-1">
            <div className="space-y-3 px-4">
            {currentChildren.length > 0 ? (
                currentChildren.map((child) => (
                    <div key={child.id} onClick={() => handleNodeSelect(child)}>
                        <DistributorCard distributor={child} isVertical={true} onShowDownline={() => handleNodeSelect(child)} />
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-center py-8">No downline members.</p>
            )}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}
