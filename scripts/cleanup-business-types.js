#!/usr/bin/env node

/**
 * Script to clean up all business types from Firestore
 */

const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

async function cleanupBusinessTypes() {
  console.log('🧹 Starting business types cleanup...\n');
  
  try {
    const snapshot = await db.collection('business_classifications').get();
    
    if (snapshot.empty) {
      console.log('✅ No business types found. Collection is already empty.');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} business type(s) to delete\n`);
    
    let deleted = 0;
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   🗑️  Deleting: ${data.business_type || doc.id}`);
      batch.delete(doc.ref);
      deleted++;
    });
    
    await batch.commit();
    
    console.log(`\n✅ Successfully deleted ${deleted} business type(s)`);
    console.log('🎉 Cleanup complete!\n');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupBusinessTypes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
