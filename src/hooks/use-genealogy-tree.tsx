
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { useAuth } from './use-auth';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

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
        
        const allNodes = Array.from(distributorsMap.values());

        // The root is the node with a null parentId.
        root = allNodes.find(d => d.parentId === null) || null;

        // Fallback if no explicit root is found
        if (!root && allNodes.length > 0) {
            root = allNodes.find(d => d.id === '3HnlVIX0LXdkIynM14QVKn4YP0b2') || allNodes[0];
        }

        allNodes.forEach(distributor => {
            // Don't try to parent the root node
            if (distributor.id === root?.id) return;

            if (distributor.parentId && distributorsMap.has(distributor.parentId)) {
                distributorsMap.get(distributor.parentId)!.children.push(distributor);
            } else if (distributor.id !== root?.id) {
                // If a node has no parent and it's not the root, attach it to the root
                root?.children.push(distributor);
            }
        });

        // Sort children alphabetically
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
        const distributorsCollection = collection(firestore, 'distributors');
        // Temporarily generate a client-side ID for the avatar URL, though it won't match the final doc ID.
        // This is a minor trade-off for using addDoc. A better solution might involve a placeholder avatar.
        const tempIdForAvatar = doc(collection(firestore, 'temp')).id;
        
        const newDistributor: Omit<Distributor, 'id' | 'children'> = {
            name: childData.name,
            email: childData.email,
            avatarUrl: childData.avatarUrl || `https://i.pravatar.cc/150?u=${tempIdForAvatar}`,
            joinDate: new Date().toISOString(),
            status: 'active',
            rank: 'LV0',
            parentId: parentId,
            placementId: parentId,
            personalVolume: childData.personalVolume,
            recruits: 0,
            commissions: 0,
        };
        
        // Use addDocumentNonBlocking to let Firestore generate the ID
        const docRefPromise = addDocumentNonBlocking(distributorsCollection, newDistributor);

        // After the document is created, we could update it with its own ID if necessary, but it's often not needed.
        docRefPromise.then(docRef => {
            if (docRef) {
                setDoc(docRef, { id: docRef.id }, { merge: true });
            }
        });

    } catch (error) {
        console.error("Error adding distributor: ", error);
    }
  }, [firestore]);
  
  const getDownline = useCallback((nodeId: string): Distributor[] => {
      if (!allDistributors) return [];
      return manager.getDownline(nodeId, allDistributors);
  }, [allDistributors, manager]);

  // The overall loading state depends on both auth and firestore loading
  const loading = isAuthLoading || isDistributorsLoading;

  return { tree, allDistributors, loading, addDistributor, getDownline };
}
