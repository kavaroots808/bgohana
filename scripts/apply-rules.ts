
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, DocumentData } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Distributor extends DocumentData {
  id: string;
  name: string;
  parentId: string | null;
  rank: string;
  status: 'funded' | 'not-funded';
}

async function applyAdvancementRules() {
  console.log('Fetching all distributors...');
  const distributorsRef = collection(db, 'distributors');
  const snapshot = await getDocs(distributorsRef);

  if (snapshot.empty) {
    console.log('No distributors found.');
    return;
  }

  const distributors: Distributor[] = [];
  snapshot.forEach(doc => {
    distributors.push({ id: doc.id, ...doc.data() } as Distributor);
  });

  const distributorsMap = new Map<string, Distributor>(distributors.map(d => [d.id, d]));
  const batch = writeBatch(db);
  let updatesMade = 0;

  console.log(`Analyzing ${distributors.length} distributors for LV1 advancement...`);

  for (const distributor of distributors) {
    // We only check for advancement from LV0 to LV1
    if (distributor.rank === 'LV0') {
      const children = distributors.filter(d => d.parentId === distributor.id);
      const fundedChildrenCount = children.filter(child => {
          const childDoc = distributorsMap.get(child.id);
          return childDoc?.status === 'funded';
      }).length;

      if (fundedChildrenCount >= 5) {
        console.log(`- Promoting ${distributor.name} (ID: ${distributor.id}) to LV1. They have ${fundedChildrenCount} funded children.`);
        const distributorDocRef = doc(db, 'distributors', distributor.id);
        batch.update(distributorDocRef, { rank: 'LV1' });
        updatesMade++;
      }
    }
  }

  if (updatesMade > 0) {
    console.log(`\nFound ${updatesMade} distributors eligible for promotion. Committing updates...`);
    await batch.commit();
    console.log('Successfully updated distributor ranks.');
  } else {
    console.log('\nNo distributors were eligible for promotion to LV1 at this time.');
  }
}

applyAdvancementRules()
  .then(() => {
    console.log('\nRule application script finished.');
    process.exit(0);
  })
  .catch(error => {
    console.error('An error occurred while applying rules:', error);
    process.exit(1);
  });
