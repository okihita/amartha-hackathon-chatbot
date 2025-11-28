const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

// Get all business types
router.get('/business-types', async (req, res) => {
  try {
    const snapshot = await db.collection('business_classifications').get();
    const businessTypes = [];
    snapshot.forEach(doc => {
      businessTypes.push({ id: doc.id, ...doc.data() });
    });
    res.json(businessTypes);
  } catch (error) {
    console.error('Error fetching business types:', error);
    res.status(500).json({ error: 'Failed to fetch business types' });
  }
});

// Get all financial literacy modules
router.get('/financial-literacy', async (req, res) => {
  try {
    const snapshot = await db.collection('financial_literacy').get();
    const modules = [];
    snapshot.forEach(doc => {
      modules.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by module number
    modules.sort((a, b) => (a.module_number || 999) - (b.module_number || 999));
    
    res.json(modules);
  } catch (error) {
    console.error('Error fetching financial literacy:', error);
    res.status(500).json({ error: 'Failed to fetch financial literacy' });
  }
});

module.exports = router;
