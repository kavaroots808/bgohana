'use client';
import { useState, useEffect, useCallback } from 'react';
import { genealogyManager } from '@/lib/data';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { useAuth } from './use-auth';


export function useGenealogyTree(currentUserId?: string) {
  const [tree, setTree] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const refreshTree = useCallback(() => {
    setLoading(true);
    // Use the logged-in user's ID, or default to '1' if no user is logged in
    const rootId = user ? user.uid : '1';
    const newTree = genealogyManager.buildTreeFromMap(rootId);
    setTree(newTree);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  const addDistributor = useCallback((childData: NewDistributorData, parentId: string) => {
    genealogyManager.addDistributor(childData, parentId);
    refreshTree();
  }, [refreshTree]);

  return { tree, loading, addDistributor };
}
