'use client';
import type { Distributor } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { FullTreeNode } from './full-tree-node';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {

  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  return (
    <ScrollArea className="w-full h-full" style={{ viewportOverflow: 'scroll' }}>
        <div className="p-8 w-max">
            <div className='tree'>
                <FullTreeNode node={tree} />
            </div>
        </div>
    </ScrollArea>
  );
}
