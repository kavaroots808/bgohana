'use client';
import { useState, useEffect, useCallback } from 'react';
import { genealogyManager } from '@/lib/data';
import type { Distributor, NewDistributorData } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

export function useGenealogyTree(currentUserId?: string) {
  const [tree, setTree] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    if (!firestore || !user) return;

    // Use a single listener for all distributors
    const distributorsCol = collection(firestore, 'distributors');
    const unsubscribe = onSnapshot(distributorsCol, (snapshot) => {
      const distributorsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Distributor));
      
      // Initialize the manager with the new data
      genealogyManager.initializeWithData(distributorsData, user.uid);
      
      // Build and set the tree
      const newTree = genealogyManager.buildTreeFromMap();
      setTree(newTree);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching distributors:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  const addDistributor = useCallback(async (childData: NewDistributorData, parentId: string) => {
    if (!firestore) return;
    
    // The genealogyManager logic for adding a distributor will be different now.
    // We need to create a new document in Firestore.
    // The local manager will update via the onSnapshot listener.
    const newId = doc(collection(firestore, 'distributors')).id; // Generate a new ID
    const sponsor = genealogyManager.findNodeById(parentId);
    if (!sponsor) {
        console.error("Sponsor not found locally");
        return;
    }

    const newDistributor: Omit<Distributor, 'children' | 'groupVolume' | 'generationalVolume' | 'canRecruit' | 'level' | 'customers'> = {
        id: newId,
        name: data.name,
        email: data.email,
        parentId: parentId,
        placementId: parentId, // Simple placement for now
        status: 'active',
        joinDate: new Date().toISOString(),
        personalVolume: data.personalVolume || 0,
        recruits: 0,
        commissions: 0,
        avatarUrl: data.avatarUrl || `https://picsum.photos/seed/${newId}/200/200`,
        rank: 'LV0',
    };

    try {
        const docRef = doc(firestore, 'distributors', newId);
        await setDoc(docRef, newDistributor);
    } catch (error) {
        console.error("Error adding new distributor to Firestore:", error);
    }

  }, [firestore]);
  
  return { tree, loading, addDistributor };
}
