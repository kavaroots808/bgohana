'use client';
import { useState } from 'react';
import type { Distributor } from '@/lib/types';
import { TreeNode } from './tree-node';
import { VerticalTreeNode } from './vertical-tree-node';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { genealogyManager } from '@/lib/data';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {
  const [focalNode, setFocalNode] = useState<Distributor | null>(tree);
  const [history, setHistory] = useState<Distributor[]>(tree ? [tree] : []);

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  const handleNodeSelect = (node: Distributor) => {
    if (node.children && node.children.length > 0) {
      setFocalNode(node);
      const newHistory = [];
      let currentNode: Distributor | undefined = node;
      while(currentNode) {
        newHistory.unshift(currentNode);
        currentNode = genealogyManager.findNodeById(currentNode.parentId!);
      }
      const rootNode = genealogyManager.root;
      if (rootNode && newHistory[0].id !== rootNode.id) {
         newHistory.unshift(rootNode);
      }
      setHistory(newHistory);
    }
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
    <div className="p-4 md:p-8 h-full w-full flex flex-col">
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground mb-4 px-8">
        <Home className="w-4 h-4" />
        {history.map((node, index) => (
          <div key={node.id} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => handleBreadcrumbClick(node.id)} 
              className={`hover:text-primary ${focalNode?.id === node.id ? 'text-primary font-semibold' : ''}`}
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
            <TreeNode node={focalNode} onNodeSelect={handleNodeSelect} isFocal={true} />
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
      <div className="md:hidden">
        <VerticalTreeNode node={tree} />
      </div>
    </div>
  );
}
