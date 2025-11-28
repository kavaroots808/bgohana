
'use client';
import { useState, useEffect, useCallback } from 'react';
import { genealogyManager } from '@/lib/data';
import type { Distributor, NewDistributorData } from '@/lib/types';

export function useGenealogyTree() {
  const [tree, setTree] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize and randomize the tree structure only on the client-side
    genealogyManager.initialize(true);
    setTree(genealogyManager.buildTreeFromMap());
    setLoading(false);
  }, []);

  const addDistributor = useCallback((childData: NewDistributorData, parentId: string) => {
    genealogyManager.addDistributor(childData, parentId);
    // Create a new object reference to trigger a re-render
    setTree({ ...genealogyManager.buildTreeFromMap()! });
  }, []);
  
  return { tree, loading, addDistributor };
}
