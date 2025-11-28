/**
 * Cleanup duplicate phone records (0xxx vs 62xxx)
 * Run: node scripts/cleanup-duplicate-phones.js [--dry-run]
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '..', 'service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();
const DRY_RUN = process.argv.includes('--dry-run');

async function findDuplicates() {
  const snapshot = await db.collection('users').get();
  const users = {};
  const duplicates = [];

  snapshot.docs.forEach(doc => {
    let phone = doc.id;
    // Normalize to 62 format for comparison
    const normalized = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    
    if (users[normalized]) {
      duplicates.push({ keep: users[normalized], delete: phone, normalized });
    } else {
      users[normalized] = phone;
    }
  });

  return duplicates;
}

async function deleteUserWithSubcollections(phone) {
  const userRef = db.collection('users').doc(phone);
  const subcollections = ['profile', 'business', 'loan', 'literacy', 'business_intelligence'];
  
  for (const sub of subcollections) {
    const subSnap = await userRef.collection(sub).get();
    for (const doc of subSnap.docs) {
      await doc.ref.delete();
    }
  }
  
  await userRef.delete();
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN MODE\n' : '🚀 LIVE MODE\n');
  
  const duplicates = await findDuplicates();
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found');
    process.exit(0);
  }

  console.log(`Found ${duplicates.length} duplicate(s):\n`);
  
  for (const dup of duplicates) {
    console.log(`📱 ${dup.normalized}`);
    console.log(`   Keep: ${dup.keep}`);
    console.log(`   Delete: ${dup.delete}`);
    
    if (!DRY_RUN) {
      await deleteUserWithSubcollections(dup.delete);
      console.log(`   ✅ Deleted\n`);
    } else {
      console.log(`   ⏭️  Would delete\n`);
    }
  }

  console.log(DRY_RUN ? '\nRun without --dry-run to apply changes' : '\n✅ Cleanup complete');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
