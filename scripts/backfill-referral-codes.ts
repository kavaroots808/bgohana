
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, DocumentData } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Distributor extends DocumentData {
  id: string;
  name: string;
  referralCode?: string;
}

async function backfillReferralCodes() {
  console.log('Fetching all distributors to check for missing referral codes...');
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

  const batch = writeBatch(db);
  let updatesMade = 0;

  console.log(`Analyzing ${distributors.length} distributors...`);

  for (const distributor of distributors) {
    if (!distributor.referralCode) {
      const newReferralCode = nanoid();
      console.log(`- Assigning new referral code to ${distributor.name || distributor.id}: ${newReferralCode}`);
      const distributorDocRef = doc(db, 'distributors', distributor.id);
      batch.update(distributorDocRef, { referralCode: newReferralCode });
      updatesMade++;
    }
  }

  if (updatesMade > 0) {
    console.log(`\nFound ${updatesMade} distributors missing a referral code. Committing updates...`);
    await batch.commit();
    console.log('Successfully assigned new referral codes.');
  } else {
    console.log('\nAll distributors already have a referral code. No updates needed.');
  }
}

backfillReferralCodes()
  .then(() => {
    console.log('\nReferral code backfill script finished.');
    process.exit(0);
  })
  .catch(error => {
    console.error('An error occurred during the backfill process:', error);
    process.exit(1);
  });
