const UserService = require('../services/UserService');

class UserController {
  async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async getImages(req, res) {
    try {
      const biData = await UserService.getBusinessIntelligence(req.params.phone);
      const imagesData = biData.filter(item => item.has_image && item.image_data);
      res.json(imagesData);
    } catch (error) {
      console.error('Error fetching user images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  }

  async getBusinessIntelligence(req, res) {
    try {
      const biData = await UserService.getBusinessIntelligence(req.params.phone);
      res.json(biData);
    } catch (error) {
      console.error('Error fetching business intelligence:', error);
      res.status(500).json({ error: 'Failed to fetch business intelligence' });
    }
  }

  async verify(req, res) {
    const { phone, status } = req.body;
    if (!phone || typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      const updatedUser = await UserService.verifyUser(phone, status);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error verifying user:', error);
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await UserService.deleteUser(req.params.phone);
      if (deleted) {
        res.json({ success: true, message: 'User deleted' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  async recalculateCredit(req, res) {
    try {
      const result = await UserService.calculateCreditScore(req.params.phone);
      
      if (!result) {
        return res.status(404).json({ 
          error: 'No business intelligence data found',
          message: 'User needs to send business photos via WhatsApp first'
        });
      }
      
      const biData = await UserService.getBusinessIntelligence(req.params.phone);
      
      res.json({ 
        success: true, 
        message: 'Credit score recalculated',
        credit_score: result.creditScore,
        credit_metrics: result.metrics,
        data_points: biData.length
      });
    } catch (error) {
      console.error('Error recalculating credit score:', error);
      res.status(500).json({ error: 'Failed to recalculate credit score' });
    }
  }
}

module.exports = new UserController();
