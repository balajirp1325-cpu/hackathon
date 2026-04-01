const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');
const requestController = require('../controllers/request.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, foodListingSchema } = require('../validators');
const { upload } = require('../config/cloudinary');

// Public / NGO - browse listings
router.get('/nearby', authenticate, foodController.getNearbyListings);
router.get('/:id', authenticate, foodController.getListingById);

// Donor - manage own listings
router.post(
  '/',
  authenticate,
  authorize('DONOR'),
  upload.single('image'),
  validate(foodListingSchema),
  foodController.createListing
);
router.get('/my/listings', authenticate, authorize('DONOR'), foodController.getMyListings);
router.patch('/:id', authenticate, authorize('DONOR'), foodController.updateListing);
router.delete('/:id', authenticate, authorize('DONOR'), foodController.deleteListing);

// Donor - see who claimed their food
router.get('/my/requests', authenticate, authorize('DONOR'), requestController.getDonorRequests);

// NGO - claim food
router.post('/:id/claim', authenticate, authorize('NGO'), requestController.claimFood);

module.exports = router;
