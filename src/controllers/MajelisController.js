const MajelisService = require('../services/MajelisService');

class MajelisController {
  async getAll(req, res) {
    try {
      const majelis = await MajelisService.getAllMajelis();
      res.json(majelis);
    } catch (error) {
      console.error('Error fetching majelis:', error);
      res.status(500).json({ error: 'Failed to fetch majelis' });
    }
  }

  async getById(req, res) {
    try {
      const majelis = await MajelisService.getMajelis(req.params.id);
      if (majelis) {
        res.json(majelis);
      } else {
        res.status(404).json({ error: 'Majelis not found' });
      }
    } catch (error) {
      console.error('Error fetching majelis:', error);
      res.status(500).json({ error: 'Failed to fetch majelis' });
    }
  }

  async create(req, res) {
    try {
      const majelis = await MajelisService.createMajelis(req.body);
      res.status(201).json(majelis);
    } catch (error) {
      console.error('Error creating majelis:', error);
      res.status(500).json({ error: 'Failed to create majelis' });
    }
  }

  async update(req, res) {
    try {
      const majelis = await MajelisService.updateMajelis(req.params.id, req.body);
      res.json(majelis);
    } catch (error) {
      console.error('Error updating majelis:', error);
      const statusCode = error.message === 'Majelis not found' ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await MajelisService.deleteMajelis(req.params.id);
      if (deleted) {
        res.json({ success: true, message: 'Majelis deleted' });
      } else {
        res.status(404).json({ error: 'Majelis not found' });
      }
    } catch (error) {
      console.error('Error deleting majelis:', error);
      res.status(500).json({ error: 'Failed to delete majelis' });
    }
  }

  async addMember(req, res) {
    try {
      const majelis = await MajelisService.addMember(req.params.id, req.body.phone);
      res.json({ success: true, majelis });
    } catch (error) {
      console.error('Error adding member:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const majelis = await MajelisService.removeMember(req.params.id, req.params.phone);
      res.json({ success: true, majelis });
    } catch (error) {
      console.error('Error removing member:', error);
      const statusCode = error.message === 'Majelis not found' ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = new MajelisController();
