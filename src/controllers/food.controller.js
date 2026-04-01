const foodService = require('../services/food.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const createListing = async (req, res, next) => {
  try {
    const data = { ...req.body, quantity: parseInt(req.body.quantity) };
    if (req.body.latitude) data.latitude = parseFloat(req.body.latitude);
    if (req.body.longitude) data.longitude = parseFloat(req.body.longitude);
    const listing = await foodService.createListing(req.user.id, data, req.file);
    return successResponse(res, listing, 'Food listing created', 201);
  } catch (err) {
    next(err);
  }
};

const getNearbyListings = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, foodType } = req.query;
    const userLat = lat || req.user.latitude;
    const userLng = lng || req.user.longitude;
    const listings = await foodService.getNearbyListings(userLat, userLng, radius, { foodType });
    return successResponse(res, listings);
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await foodService.getListingById(req.params.id);
    return successResponse(res, listing);
  } catch (err) {
    next(err);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { listings, total } = await foodService.getMyListings(req.user.id, page, limit);
    return paginatedResponse(res, listings, total, page, limit);
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await foodService.updateListing(req.params.id, req.user.id, req.body);
    return successResponse(res, listing, 'Listing updated');
  } catch (err) {
    next(err);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    await foodService.deleteListing(req.params.id, req.user.id);
    return successResponse(res, null, 'Listing deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createListing,
  getNearbyListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
};
