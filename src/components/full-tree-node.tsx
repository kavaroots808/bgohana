'use client';
import type { Distributor } from '@/lib/types';
import { DistributorCard } from './distributor-card';

export const FullTreeNode = ({ node }: { node: Distributor }) => {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <li>
      <div className='flex justify-center'>
        <DistributorCard distributor={node} />
      </div>
      {hasChildren && (
        <ul>
          {node.children.map(child => (
            <FullTreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};
