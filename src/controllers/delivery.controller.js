const deliveryService = require('../services/delivery.service');
const { successResponse, paginatedResponse } = require('../utils/response');

const getAvailableDeliveries = async (req, res, next) => {
  try {
    const deliveries = await deliveryService.getAvailableDeliveries(req.user.id);
    return successResponse(res, deliveries);
  } catch (err) {
    next(err);
  }
};

const acceptDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.acceptDelivery(req.user.id, req.params.requestId);
    return successResponse(res, delivery, 'Delivery accepted', 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, currentLat, currentLng } = req.body;
    const delivery = await deliveryService.updateDeliveryStatus(
      req.user.id,
      req.params.id,
      status,
      currentLat,
      currentLng
    );
    return successResponse(res, delivery, 'Status updated');
  } catch (err) {
    next(err);
  }
};

const getMyDeliveries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { deliveries, total } = await deliveryService.getMyDeliveries(req.user.id, page, limit);
    return paginatedResponse(res, deliveries, total, page, limit);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailableDeliveries, acceptDelivery, updateStatus, getMyDeliveries };
