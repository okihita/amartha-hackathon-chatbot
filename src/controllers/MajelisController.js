const MajelisService = require('../services/MajelisService');
const { handle } = require('../utils/controller');

class MajelisController {
  getAll = handle(async (req, res) => {
    res.json(await MajelisService.getAllMajelis());
  });

  getById = handle(async (req, res) => {
    const majelis = await MajelisService.getMajelis(req.params.id);
    res.status(majelis ? 200 : 404).json(majelis || { error: 'Not found' });
  });

  create = handle(async (req, res) => {
    res.status(201).json(await MajelisService.createMajelis(req.body));
  });

  update = handle(async (req, res) => {
    res.json(await MajelisService.updateMajelis(req.params.id, req.body));
  });

  delete = handle(async (req, res) => {
    const deleted = await MajelisService.deleteMajelis(req.params.id);
    res.status(deleted ? 200 : 404).json(deleted ? { success: true } : { error: 'Not found' });
  });

  addMember = handle(async (req, res) => {
    res.json({ success: true, majelis: await MajelisService.addMember(req.params.id, req.body.phone) });
  });

  removeMember = handle(async (req, res) => {
    res.json({ success: true, majelis: await MajelisService.removeMember(req.params.id, req.params.phone) });
  });
}

module.exports = new MajelisController();
