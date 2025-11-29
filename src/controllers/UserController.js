const UserService = require('../services/UserService');
const { handle } = require('../utils/controller');

class UserController {
  getAll = handle(async (req, res) => {
    res.json(await UserService.getAllUsers());
  });

  getCompleteProfile = handle(async (req, res) => {
    const profile = await UserService.getCompleteProfile(req.params.phone);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
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

  updateCapacity = handle(async (req, res) => {
    const result = await UserService.updateCapacity(req.params.phone, req.body);
    res.json({ success: true, capacity: result });
  });

  updateEngagement = handle(async (req, res) => {
    const result = await UserService.trackInteraction(req.params.phone, req.body.type || 'other');
    res.json({ success: true, engagement: result });
  });

  delete = handle(async (req, res) => {
    const deleted = await UserService.deleteUser(req.params.phone);
    res.status(deleted ? 200 : 404).json(deleted ? { success: true } : { error: 'Not found' });
  });
}

module.exports = new UserController();
