const express = require('express');
const router = express.Router();
const { 
  createMockUsers,
  deleteAllMockUsers,
  createMockMajelis,
  deleteAllMockMajelis
} = require('../db');

// Populate mock users
router.post('/populate-mock', async (req, res) => {
  try {
    const count = await createMockUsers();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error populating mock data:', error);
    res.status(500).json({ error: 'Failed to populate mock data' });
  }
});

// Delete all mock users
router.delete('/delete-all-mock', async (req, res) => {
  try {
    const count = await deleteAllMockUsers();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error deleting mock users:', error);
    res.status(500).json({ error: 'Failed to delete mock users' });
  }
});

// Populate mock majelis
router.post('/populate-mock-majelis', async (req, res) => {
  try {
    const count = await createMockMajelis();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error populating mock majelis:', error);
    res.status(500).json({ error: 'Failed to populate mock majelis' });
  }
});

// Delete all mock majelis
router.delete('/delete-all-mock-majelis', async (req, res) => {
  try {
    const count = await deleteAllMockMajelis();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error deleting mock majelis:', error);
    res.status(500).json({ error: 'Failed to delete mock majelis' });
  }
});

module.exports = router;
