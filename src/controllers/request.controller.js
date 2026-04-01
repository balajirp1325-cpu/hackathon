const requestService = require('../services/request.service');
const { successResponse, paginatedResponse } = require('../utils/response');

const claimFood = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const request = await requestService.claimFood(req.user.id, req.params.id, notes);
    return successResponse(res, request, 'Food claimed successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { requests, total } = await requestService.getMyRequests(req.user.id, page, limit);
    return paginatedResponse(res, requests, total, page, limit);
  } catch (err) {
    next(err);
  }
};

const getDonorRequests = async (req, res, next) => {
  try {
    const requests = await requestService.getDonorRequests(req.user.id);
    return successResponse(res, requests);
  } catch (err) {
    next(err);
  }
};

module.exports = { claimFood, getMyRequests, getDonorRequests };
