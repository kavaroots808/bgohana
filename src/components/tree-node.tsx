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
  const hasChildren = node.children && node.children.length > 0;
  
  const handleSelect = () => {
    if (!isFocal && onNodeSelect) {
      onNodeSelect(node);
    }
  }
  
  return (
    <li>
      <div className={!isFocal && hasChildren ? 'cursor-pointer' : ''} onClick={handleSelect}>
        <DistributorCard distributor={node} onShowDownline={onNodeSelect && hasChildren ? () => onNodeSelect(node) : undefined} />
      </div>
    </li>
  );
};
