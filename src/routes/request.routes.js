const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// NGO - view their own requests
router.get('/my', authenticate, authorize('NGO'), requestController.getMyRequests);

module.exports = router;
