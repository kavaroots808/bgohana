'use client';
import type { Distributor } from '@/lib/types';
import { TreeNode } from './tree-node';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {
  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  return (
    <div className="p-8 h-full overflow-auto text-center">
      <div className="tree inline-block">
        <ul>
          <TreeNode node={tree} />
        </ul>
      </div>
    </div>
  );
}
