'use client';
import type { Distributor } from '@/lib/types';
import { TreeNode } from './tree-node';
import { VerticalTreeNode } from './vertical-tree-node';

export function GenealogyTree({ tree }: { tree: Distributor | null }) {
  if (!tree) {
    return <p className="text-center text-muted-foreground mt-10">No genealogy data available.</p>;
  }

  return (
    <div className="p-4 md:p-8 h-full w-full">
      {/* Horizontal tree for medium screens and up */}
      <div className="hidden md:block min-w-max">
        <div className="tree inline-block">
          <ul>
            <TreeNode node={tree} />
          </ul>
        </div>
      </div>

      {/* Vertical list for small screens */}
      <div className="md:hidden">
        <VerticalTreeNode node={tree} />
      </div>
    </div>
  );
}
