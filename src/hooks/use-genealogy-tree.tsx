
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { useAuth } from './use-auth';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

// A local-only manager to build the tree from a flat list
class GenealogyTreeManager {
    private distributorsMap: Map<string, Distributor> = new Map();
    private isBuilt = false;

    public buildTree(distributors: Distributor[]): Distributor | null {
        if (!distributors || distributors.length === 0) {
            return null;
        }

        this.distributorsMap.clear();
        distributors.forEach(d => {
            this.distributorsMap.set(d.id, { ...d, children: [] });
        });

        let root: Distributor | null = null;
        
        const allNodes = Array.from(this.distributorsMap.values());

        // The root is the node with a null parentId.
        root = allNodes.find(d => d.parentId === null) || null;

        // Fallback if no explicit root is found
        if (!root && allNodes.length > 0) {
            root = allNodes.find(d => d.id === 'eFcPNPK048PlHyNqV7cAz57ukvB2') || allNodes[0];
        }

        allNodes.forEach(distributor => {
            if (distributor.id === root?.id) return;

            if (distributor.parentId && this.distributorsMap.has(distributor.parentId)) {
                const parent = this.distributorsMap.get(distributor.parentId)!;
                // Ensure children array exists
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(distributor);
            } else if (distributor.id !== root?.id) {
                if (root) {
                    if (!root.children) {
                        root.children = [];
                    }
                    root.children.push(distributor);
                }
            }
        });

        if (root) {
            const queue = [root];
            while(queue.length > 0) {
                const current = queue.shift()!;
                if (current.children && current.children.length > 0) {
                    current.children.sort((a, b) => a.name.localeCompare(b.name));
                    queue.push(...current.children);
                }
            }
        }
        this.isBuilt = true;
        return root;
    }

     public getDownline(nodeId: string, allDistributors: Distributor[]): Distributor[] {
        const distributorsMap = new Map<string, Distributor>();
        allDistributors.forEach(d => {
            distributorsMap.set(d.id, { ...d, children: [] });
        });

        const startNode = distributorsMap.get(nodeId);
        if (!startNode) return [];

        const downline: Distributor[] = [];
        const queue: string[] = [startNode.id];
        const visited = new Set<string>(); // Don't include the start node in visited initially

        let head = 0;
        while(head < queue.length) {
            const currentId = queue[head++]!;
            
            for (const potentialChild of allDistributors) {
                if (potentialChild.parentId === currentId && !visited.has(potentialChild.id)) {
                    visited.add(potentialChild.id);
                    downline.push(potentialChild);
                    queue.push(potentialChild.id);
                }
            }
        }
        return downline;
    }

    public getDownlineTree(nodeId: string): Distributor[] | null {
        if (!this.isBuilt) return null;
        const startNode = this.distributorsMap.get(nodeId);
        return startNode ? startNode.children : null;
    }
}

export function useGenealogyTree() {
  const { firestore } = useFirebase();
  const { user, loading: isAuthLoading } = useAuth();

  const distributorsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'distributors');
  }, [firestore, user]);

  const { data: allDistributors, isLoading: isDistributorsLoading } = useCollection<Distributor>(distributorsQuery);

  const [tree, setTree] = useState<Distributor | null>(null);

  const manager = useMemo(() => new GenealogyTreeManager(), []);

  useEffect(() => {
    if (allDistributors && allDistributors.length > 0) {
        const fullTree = manager.buildTree(allDistributors);
        setTree(fullTree);
    } else if (!isDistributorsLoading) {
        setTree(null); // No data, not loading
    }
  }, [allDistributors, isDistributorsLoading, manager]);

  const addDistributor = useCallback(async (childData: NewDistributorData, parentId: string) => {
    if (!firestore) return;

    try {
        const newDocRef = doc(collection(firestore, 'distributors'));
        
        const newDistributor: Omit<Distributor, 'id'> = {
            name: childData.name,
            email: childData.email,
            avatarUrl: childData.avatarUrl || `https://i.pravatar.cc/150?u=${newDocRef.id}`,
            joinDate: new Date().toISOString(),
            status: 'not-funded',
            rank: 'LV0',
            parentId: parentId,
            placementId: parentId,
            personalVolume: childData.personalVolume,
            recruits: 0,
            commissions: 0,
            sponsorSelected: true,
            referralCode: nanoid(),
        };
        
        await setDoc(newDocRef, newDistributor);

    } catch (error) {
        console.error("Error adding distributor: ", error);
        throw error;
    }
  }, [firestore]);
  
  const getDownline = useCallback((nodeId: string): Distributor[] => {
      if (!allDistributors) return [];
      return manager.getDownline(nodeId, allDistributors);
  }, [allDistributors, manager]);

  const getDownlineTree = useCallback((nodeId: string): Distributor[] | null => {
      // Rebuild the tree structure from the flat list to get the specific subtree
      if (!allDistributors) return null;
      manager.buildTree(allDistributors); // Ensure map is up-to-date
      return manager.getDownlineTree(nodeId);
  }, [allDistributors, manager]);

  const loading = isAuthLoading || isDistributorsLoading;

  return { tree, allDistributors, loading, addDistributor, getDownline, getDownlineTree };
}
