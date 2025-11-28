const express = require('express');
const router = express.Router();
const { 
  getAllMajelis,
  getMajelis,
  createMajelis,
  updateMajelis,
  deleteMajelis,
  addMemberToMajelis,
  removeMemberFromMajelis
} = require('../db');

// Get all majelis
router.get('/', async (req, res) => {
  try {
    const majelis = await getAllMajelis();
    res.json(majelis);
  } catch (error) {
    console.error('Error fetching majelis:', error);
    res.status(500).json({ error: 'Failed to fetch majelis' });
  }
});

// Get single majelis
router.get('/:id', async (req, res) => {
  try {
    const majelis = await getMajelis(req.params.id);
    if (majelis) {
      res.json(majelis);
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error fetching majelis:', error);
    res.status(500).json({ error: 'Failed to fetch majelis' });
  }
});

// Create majelis
router.post('/', async (req, res) => {
  try {
    const majelis = await createMajelis(req.body);
    if (majelis) {
      res.json({ success: true, majelis });
    } else {
      res.status(500).json({ error: 'Failed to create majelis' });
    }
  } catch (error) {
    console.error('Error creating majelis:', error);
    res.status(500).json({ error: 'Failed to create majelis' });
  }
});

// Update majelis
router.put('/:id', async (req, res) => {
  try {
    const majelis = await updateMajelis(req.params.id, req.body);
    if (majelis) {
      res.json({ success: true, majelis });
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error updating majelis:', error);
    res.status(500).json({ error: 'Failed to update majelis' });
  }
});

// Delete majelis
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteMajelis(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Majelis deleted' });
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error deleting majelis:', error);
    res.status(500).json({ error: 'Failed to delete majelis' });
  }
});

// Add member to majelis
router.post('/:id/members', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await addMemberToMajelis(req.params.id, phone);
    
    if (!result) {
      return res.status(404).json({ error: 'Majelis not found' });
    }
    
    if (result.error) {
      return res.status(400).json({ 
        error: result.error,
        currentMajelisId: result.currentMajelisId 
      });
    }
    
    res.json({ success: true, majelis: result });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from majelis
router.delete('/:id/members/:phone', async (req, res) => {
  try {
    const majelis = await removeMemberFromMajelis(req.params.id, req.params.phone);
    if (majelis) {
      res.json({ success: true, majelis });
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
