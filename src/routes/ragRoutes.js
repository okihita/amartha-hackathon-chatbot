const express = require('express');
const router = express.Router();
const RAGRepository = require('../repositories/RAGRepository');

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

module.exports = router;
