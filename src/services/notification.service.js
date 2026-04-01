const prisma = require('../config/database');
const { getIO } = require('../sockets');

const createNotification = async ({ userId, title, message, type, data }) => {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, data },
  });

  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  return notification;
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, readStatus: false } }),
  ]);
  return { notifications, total, unreadCount };
};

const markAsRead = async (userId, notificationId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readStatus: true },
  });
};

const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, readStatus: false },
    data: { readStatus: true },
  });
};

module.exports = { createNotification, getUserNotifications, markAsRead, markAllAsRead };
