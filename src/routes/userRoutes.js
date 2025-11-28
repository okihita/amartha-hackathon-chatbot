const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  updateUserStatus, 
  deleteUser,
  getUserBusinessIntelligence,
  updateUserCreditScore
} = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user business images
router.get('/:phone/images', async (req, res) => {
  try {
    const biData = await getUserBusinessIntelligence(req.params.phone);
    const imagesData = biData.filter(item => item.has_image && item.image_data);
    res.json(imagesData);
  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get user business intelligence
router.get('/:phone/business-intelligence', async (req, res) => {
  try {
    const biData = await getUserBusinessIntelligence(req.params.phone);
    res.json(biData);
  } catch (error) {
    console.error('Error fetching business intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch business intelligence' });
  }
});

// Verify user
router.post('/verify', async (req, res) => {
  const { phone, status } = req.body;
  if (!phone || typeof status !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const updatedUser = await updateUserStatus(phone, status);
    if (updatedUser) {
      res.json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:phone', async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.phone);
    if (deleted) {
      res.json({ success: true, message: 'User deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Recalculate credit score
router.post('/:phone/recalculate-credit', async (req, res) => {
  try {
    const biData = await getUserBusinessIntelligence(req.params.phone);
    
    if (biData.length === 0) {
      return res.status(404).json({ 
        error: 'No business intelligence data found',
        message: 'User needs to send business photos via WhatsApp first'
      });
    }
    
    await updateUserCreditScore(req.params.phone);
    
    const users = await getAllUsers();
    const updatedUser = users.find(u => u.phone === req.params.phone);
    
    res.json({ 
      success: true, 
      message: 'Credit score recalculated',
      credit_score: updatedUser?.credit_score,
      credit_metrics: updatedUser?.credit_metrics,
      data_points: biData.length
    });
  } catch (error) {
    console.error('Error recalculating credit score:', error);
    res.status(500).json({ error: 'Failed to recalculate credit score' });
  }
});

module.exports = router;
