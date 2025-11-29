
// USAGE: npx tsx scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config'; // Adjust the path as necessary
import { mockDistributors } from '../src/lib/data';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function seedDatabase() {
  const distributorsCollection = collection(db, 'distributors');
  const batch = writeBatch(db);

  mockDistributors.forEach((distributor) => {
    const docRef = doc(distributorsCollection, distributor.id);
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
