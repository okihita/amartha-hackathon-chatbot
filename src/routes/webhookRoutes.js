const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/WebhookController');

router.get('/', WebhookController.verify.bind(WebhookController));
router.post('/', WebhookController.handleMessage.bind(WebhookController));

module.exports = router;
