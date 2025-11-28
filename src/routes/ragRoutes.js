const express = require('express');
const router = express.Router();
const RAGRepository = require('../repositories/RAGRepository');
const { reimportFinancialLiteracy } = require('../services/ImportService');

router.get('/knowledge/business-classifications', async (req, res) => {
  try {
    const businessClassifications = await RAGRepository.getBusinessTypes();
    res.json(businessClassifications);
  } catch (error) {
    console.error('Error fetching business classifications:', error);
    res.status(500).json({ error: 'Failed to fetch business classifications' });
  }
});

router.get('/knowledge/financial-literacy', async (req, res) => {
  try {
    const modules = await RAGRepository.getFinancialLiteracy();
    res.json(modules);
  } catch (error) {
    console.error('Error fetching financial literacy:', error);
    res.status(500).json({ error: 'Failed to fetch financial literacy' });
  }
});

router.post('/knowledge/financial-literacy/reimport', async (req, res) => {
  try {
    console.log('📚 Starting financial literacy reimport...');
    const result = await reimportFinancialLiteracy();
    console.log(`✅ Reimport complete: ${result.imported}/${result.total} weeks`);
    res.json(result);
  } catch (error) {
    console.error('❌ Reimport failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
