const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.getAll.bind(UserController));
router.get('/:phone/complete', UserController.getCompleteProfile.bind(UserController));
router.get('/:phone/images', UserController.getImages.bind(UserController));
router.get('/:phone/business-intelligence', UserController.getBusinessIntelligence.bind(UserController));
router.post('/verify', UserController.verify.bind(UserController));
router.delete('/:phone', UserController.delete.bind(UserController));

module.exports = router;
