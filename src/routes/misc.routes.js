const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const ratingController = require('../controllers/rating.controller');
const cancelledOrderController = require('../controllers/cancelledOrder.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, ratingSchema } = require('../validators');

// Notifications
router.get('/notifications', authenticate, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticate, notificationController.markAsRead);
router.patch('/notifications/read-all', authenticate, notificationController.markAllAsRead);

// Ratings
router.post('/ratings', authenticate, validate(ratingSchema), ratingController.submitRating);
router.get('/ratings/:userId', authenticate, ratingController.getUserRatings);

// Cancelled orders (NGO only)
router.get('/cancelled-orders', authenticate, authorize('NGO'), cancelledOrderController.getCancelledOrders);
router.post('/cancelled-orders/:id/claim', authenticate, authorize('NGO'), cancelledOrderController.claimOrder);

module.exports = router;
