
// USAGE: npx tsx scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config'; // Adjust the path as necessary
import type { Distributor, DistributorRank } from '../src/lib/types';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const mockDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'generationalVolume' | 'canRecruit' | 'level' | 'customers' | 'commissions' | 'recruits' >[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    parentId: null,
    placementId: null,
    status: 'active',
    joinDate: '2023-01-15T09:00:00Z',
    personalVolume: 150,
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    rank: 'LV6',
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    parentId: '1',
    placementId: '1',
    status: 'active',
    joinDate: '2023-02-20T10:00:00Z',
    personalVolume: 200,
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    rank: 'LV4',
  },
  {
    id: '3',
    name: 'Charlie',
    email: 'charlie@example.com',
    parentId: '1',
    placementId: '1',
    status: 'active',
    joinDate: '2023-03-10T11:30:00Z',
    personalVolume: 100,
    avatarUrl: 'https://i.pravatar.cc/150?u=3',
    rank: 'LV2',
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@example.com',
    parentId: '2',
    placementId: '2',
    status: 'inactive',
    joinDate: '2023-04-05T14:00:00Z',
    personalVolume: 50,
    avatarUrl: 'https://i.pravatar.cc/150?u=4',
    rank: 'LV0',
  },
  {
    id: '5',
    name: 'Ethan',
    email: 'ethan@example.com',
    parentId: '2',
    placementId: '2',
    status: 'active',
    joinDate: '2023-05-12T09:30:00Z',
    personalVolume: 300,
    avatarUrl: 'https://i.pravatar.cc/150?u=5',
    rank: 'LV1',
  },
    {
    id: '6',
    name: 'Fiona',
    email: 'fiona@example.com',
    parentId: '3',
    placementId: '3',
    status: 'active',
    joinDate: '2023-06-18T16:00:00Z',
    personalVolume: 120,
    avatarUrl: 'https://i.pravatar.cc/150?u=6',
    rank: 'LV1',
  },
  {
    id: '7',
    name: 'George',
    email: 'george@example.com',
    parentId: '3',
    placementId: '3',
    status: 'active',
    joinDate: '2023-07-22T11:00:00Z',
    personalVolume: 180,
    avatarUrl: 'https://i.pravatar.cc/150?u=7',
    rank: 'LV0',
  },
  {
    id: '8',
    name: 'Hannah',
    email: 'hannah@example.com',
    parentId: '5',
    placementId: '5',
    status: 'active',
    joinDate: '2023-08-30T13:45:00Z',
    personalVolume: 220,
    avatarUrl: 'https://i.pravatar.cc/150?u=8',
    rank: 'LV0',
  },
];

async function seedDatabase() {
  const distributorsCollection = collection(db, 'distributors');
  const batch = writeBatch(db);

  mockDistributors.forEach((distributor) => {
    const docRef = distributorsCollection.doc(distributor.id);
    const data = {
        ...distributor,
        commissions: Math.floor(Math.random() * 5000),
        recruits: 0 // Will be calculated by manager
    };
    batch.set(docRef, data);
  });

  try {
    await batch.commit();
    console.log('Successfully seeded database with mock distributors.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Force exit script
    process.exit(0);
  }
}

seedDatabase();
