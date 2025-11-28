'use client';
import type { Distributor } from '@/lib/types';
import { DistributorCard } from './distributor-card';

export const TreeNode = ({ node }: { node: Distributor }) => {
  return (
    <li>
      <div className="cursor-pointer inline-block">
        <DistributorCard distributor={node} />
      </div>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};
