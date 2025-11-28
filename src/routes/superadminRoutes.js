const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const MajelisService = require('../services/MajelisService');

router.post('/populate-mock', async (req, res) => {
  try {
    const count = await UserService.createMockUsers();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error populating mock data:', error);
    res.status(500).json({ error: 'Failed to populate mock data' });
  }
});

router.delete('/delete-all-mock', async (req, res) => {
  try {
    const count = await UserService.deleteMockUsers();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error deleting mock users:', error);
    res.status(500).json({ error: 'Failed to delete mock users' });
  }
});

router.post('/populate-mock-majelis', async (req, res) => {
  try {
    const count = await MajelisService.createMockMajelis();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error populating mock majelis:', error);
    res.status(500).json({ error: 'Failed to populate mock majelis' });
  }
});

router.delete('/delete-all-mock-majelis', async (req, res) => {
  try {
    const count = await MajelisService.deleteMockMajelis();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error deleting mock majelis:', error);
    res.status(500).json({ error: 'Failed to delete mock majelis' });
  }
});

module.exports = router;
