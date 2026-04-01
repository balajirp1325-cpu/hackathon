const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, deliveryStatusSchema } = require('../validators');

// Volunteer routes
router.get('/available', authenticate, authorize('VOLUNTEER'), deliveryController.getAvailableDeliveries);
router.post('/:requestId/accept', authenticate, authorize('VOLUNTEER'), deliveryController.acceptDelivery);
router.patch('/:id/status', authenticate, authorize('VOLUNTEER'), validate(deliveryStatusSchema), deliveryController.updateStatus);
router.get('/my', authenticate, authorize('VOLUNTEER'), deliveryController.getMyDeliveries);

module.exports = router;
