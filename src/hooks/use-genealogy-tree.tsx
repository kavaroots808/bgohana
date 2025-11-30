
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { useAuth } from './use-auth';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

// A local-only manager to build the tree from a flat list
class GenealogyTreeManager {
    public buildTree(distributors: Distributor[]): Distributor | null {
        if (!distributors || distributors.length === 0) {
            return null;
        }

        const distributorsMap = new Map<string, Distributor>();
        distributors.forEach(d => {
            distributorsMap.set(d.id, { ...d, children: [] });
        });

        let root: Distributor | null = null;
        
        distributorsMap.forEach(distributor => {
            if (distributor.parentId && distributorsMap.has(distributor.parentId)) {
                distributorsMap.get(distributor.parentId)!.children.push(distributor);
            } else {
                // Heuristic to find the root: either no parentId or is the ultimate ancestor
                if (!root) { // Simple root finding
                    root = distributor;
                }
            }
        });
        
        // Fallback to find any node without a parent if root isn't set
        if (!root) {
            for (const d of distributorsMap.values()) {
                if (!d.parentId) {
                    root = d;
                    break;
                }
            }
        }
        
        // Fallback to just taking the first if no clear root
        if (!root && distributorsMap.size > 0) {
            root = distributorsMap.values().next().value;
        }


        // Sort children by join date if needed
        distributorsMap.forEach(d => {
            d.children.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        });

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
        const queue: Distributor[] = [startNode];
        const visited = new Set<string>([startNode.id]);

        let head = 0;
        while(head < queue.length) {
            const currentNode = queue[head++]!;
            
            // Find children from the full list
            for (const potentialChild of allDistributors) {
                if (potentialChild.parentId === currentNode.id && !visited.has(potentialChild.id)) {
                    visited.add(potentialChild.id);
                    downline.push(potentialChild);
                    queue.push(potentialChild);
                }
            }
        }
        return downline;
    }
}

export function useGenealogyTree() {
  const { firestore } = useFirebase();
  const { user } = useAuth();

  const distributorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'distributors');
  }, [firestore]);

  const { data: allDistributors, isLoading: isDistributorsLoading } = useCollection<Distributor>(distributorsQuery);

  const [tree, setTree] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);

  const manager = useMemo(() => new GenealogyTreeManager(), []);

  useEffect(() => {
    setLoading(true);
    if (allDistributors && allDistributors.length > 0) {
        const fullTree = manager.buildTree(allDistributors);
        setTree(fullTree);
    } else if (!isDistributorsLoading) {
        setTree(null); // No data, not loading
    }
    setLoading(isDistributorsLoading);
  }, [allDistributors, isDistributorsLoading, manager]);

  const addDistributor = useCallback(async (childData: NewDistributorData, parentId: string) => {
    if (!firestore) return;

    try {
        const newDocRef = doc(collection(firestore, 'distributors'));
        const newDistributor: Omit<Distributor, 'children' | 'groupVolume' | 'generationalVolume' | 'canRecruit' | 'level' | 'customers'> = {
            id: newDocRef.id,
            name: childData.name,
            email: childData.email,
            avatarUrl: childData.avatarUrl || `https://i.pravatar.cc/150?u=${newDocRef.id}`,
            joinDate: new Date().toISOString(),
            status: 'active',
            rank: 'LV0',
            parentId: parentId,
            placementId: parentId,
            personalVolume: childData.personalVolume,
            recruits: 0,
            commissions: 0,
        };
        
        await setDoc(newDocRef, newDistributor);

        // The real-time listener from useCollection will handle updating the state
    } catch (error) {
        console.error("Error adding distributor: ", error);
    }
  }, [firestore]);
  
  const getDownline = useCallback((nodeId: string): Distributor[] => {
      if (!allDistributors) return [];
      return manager.getDownline(nodeId, allDistributors);
  }, [allDistributors, manager]);

  return { tree, allDistributors, loading, addDistributor, getDownline };
}
