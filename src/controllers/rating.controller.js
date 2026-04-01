const ratingService = require('../services/rating.service');
const { successResponse, paginatedResponse } = require('../utils/response');

const submitRating = async (req, res, next) => {
  try {
    const rating = await ratingService.submitRating(req.user.id, req.body);
    return successResponse(res, rating, 'Rating submitted', 201);
  } catch (err) {
    next(err);
  }
};

const getUserRatings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { ratings, total } = await ratingService.getUserRatings(req.params.userId, page, limit);
    return paginatedResponse(res, ratings, total, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitRating, getUserRatings };
