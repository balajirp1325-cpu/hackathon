const cron = require('node-cron');
const prisma = require('../config/database');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

const expireListings = async () => {
  try {
    const expired = await prisma.foodListing.findMany({
      where: {
        status: 'AVAILABLE',
        expiryTime: { lt: new Date() },
      },
      include: {
        donor: { select: { id: true, name: true } },
      },
    });

    if (expired.length === 0) return;

    const ids = expired.map((l) => l.id);

    await prisma.foodListing.updateMany({
      where: { id: { in: ids } },
      data: { status: 'EXPIRED' },
    });

    // Notify donors
    for (const listing of expired) {
      await notificationService.createNotification({
        userId: listing.donor.id,
        title: 'Listing Expired',
        message: `Your listing "${listing.title}" has expired and been removed from the feed.`,
        type: 'NEW_LISTING', // reuse or extend enum as needed
        data: { listingId: listing.id },
      });
    }

    logger.info(`Expired ${expired.length} listing(s)`);
  } catch (err) {
    logger.error('Expiry cron error:', err);
  }
};

const cleanupOldRefreshTokens = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      logger.info(`Cleaned up ${result.count} expired refresh token(s)`);
    }
  } catch (err) {
    logger.error('Refresh token cleanup error:', err);
  }
};

const cleanupExpiredCancelledOrders = async () => {
  try {
    await prisma.cancelledOrder.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch (err) {
    logger.error('Cancelled order cleanup error:', err);
  }
};

const startCronJobs = () => {
  // Every minute: expire listings
  cron.schedule('* * * * *', expireListings);

  // Every hour: clean up expired refresh tokens
  cron.schedule('0 * * * *', cleanupOldRefreshTokens);

  // Every 10 minutes: clean up expired cancelled orders
  cron.schedule('*/10 * * * *', cleanupExpiredCancelledOrders);

  logger.info('Cron jobs started');
};

module.exports = { startCronJobs };
