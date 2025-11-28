const express = require('express');
const router = express.Router();
const MajelisController = require('../controllers/MajelisController');

router.get('/', MajelisController.getAll.bind(MajelisController));
router.get('/:id', MajelisController.getById.bind(MajelisController));
router.post('/', MajelisController.create.bind(MajelisController));
router.put('/:id', MajelisController.update.bind(MajelisController));
router.delete('/:id', MajelisController.delete.bind(MajelisController));
router.post('/:id/members', MajelisController.addMember.bind(MajelisController));
router.delete('/:id/members/:phone', MajelisController.removeMember.bind(MajelisController));

module.exports = router;
