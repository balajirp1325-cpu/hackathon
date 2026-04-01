const cancelledOrderService = require('../services/cancelledOrder.service');
const { successResponse } = require('../utils/response');

const getCancelledOrders = async (req, res, next) => {
  try {
    const { lat, lng, radius = 15 } = req.query;
    const userLat = lat || req.user.latitude;
    const userLng = lng || req.user.longitude;
    const orders = await cancelledOrderService.getCancelledOrders(userLat, userLng, radius);
    return successResponse(res, orders);
  } catch (err) {
    next(err);
  }
};

const claimOrder = async (req, res, next) => {
  try {
    const order = await cancelledOrderService.claimCancelledOrder(req.user.id, req.params.id);
    return successResponse(res, order, 'Order claimed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCancelledOrders, claimOrder };
