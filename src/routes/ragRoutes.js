const express = require('express');
const router = express.Router();
const RAGRepository = require('../repositories/RAGRepository');

router.get('/business-types', async (req, res) => {
  try {
    const businessTypes = await RAGRepository.getBusinessTypes();
    res.json(businessTypes);
  } catch (error) {
    console.error('Error fetching business types:', error);
    res.status(500).json({ error: 'Failed to fetch business types' });
  }
});

router.get('/financial-literacy', async (req, res) => {
  try {
    const modules = await RAGRepository.getFinancialLiteracy();
    res.json(modules);
  } catch (error) {
    console.error('Error fetching financial literacy:', error);
    res.status(500).json({ error: 'Failed to fetch financial literacy' });
  }
});

module.exports = router;
