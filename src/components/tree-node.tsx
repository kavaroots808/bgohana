'use client';
import type { Distributor } from '@/lib/types';
import { DistributorCard } from './distributor-card';

export const TreeNode = ({ 
  node, 
  onNodeSelect,
  isFocal = false 
}: { 
  node: Distributor;
  onNodeSelect?: (node: Distributor) => void;
  isFocal?: boolean;
}) => {
  return (
    <li>
      <div className={!isFocal ? 'cursor-pointer' : ''} onClick={() => !isFocal && onNodeSelect && onNodeSelect(node)}>
        <DistributorCard distributor={node} onShowDownline={onNodeSelect ? () => onNodeSelect(node) : undefined} />
      </div>
      {node.children && node.children.length > 0 && !isFocal && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onNodeSelect={onNodeSelect} />
          ))}
        </ul>
      )}
    </li>
  );
};
