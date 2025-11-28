const UserService = require('../services/UserService');
const { handle } = require('../utils/controller');

class UserController {
  getAll = handle(async (req, res) => {
    res.json(await UserService.getAllUsers());
  });

  getImages = handle(async (req, res) => {
    const data = await UserService.getBusinessIntelligence(req.params.phone);
    res.json(data.filter(item => item.has_image && item.image_data));
  });

  getBusinessIntelligence = handle(async (req, res) => {
    res.json(await UserService.getBusinessIntelligence(req.params.phone));
  });

  verify = handle(async (req, res) => {
    const { phone, status } = req.body;
    if (!phone || typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request' });
    }
    res.json({ success: true, user: await UserService.verifyUser(phone, status) });
  });

  delete = handle(async (req, res) => {
    const deleted = await UserService.deleteUser(req.params.phone);
    res.status(deleted ? 200 : 404).json(deleted ? { success: true } : { error: 'Not found' });
  });

  recalculateCredit = handle(async (req, res) => {
    const result = await UserService.calculateCreditScore(req.params.phone);
    if (!result) {
      return res.status(404).json({ error: 'No business intelligence data' });
    }
    const biData = await UserService.getBusinessIntelligence(req.params.phone);
    res.json({ 
      success: true,
      credit_score: result.creditScore,
      credit_metrics: result.metrics,
      data_points: biData.length
    });
  });
}

module.exports = new UserController();
