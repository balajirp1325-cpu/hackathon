const notificationService = require('../services/notification.service');
const { successResponse, paginatedResponse } = require('../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { notifications, total, unreadCount } = await notificationService.getUserNotifications(
      req.user.id,
      page,
      limit
    );
    return res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.user.id, req.params.id);
    return successResponse(res, null, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
