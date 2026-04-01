const prisma = require('../config/database');
const notificationService = require('./notification.service');

const submitRating = async (fromUserId, { toUserId, deliveryId, rating, review }) => {
  // Verify delivery exists and user was involved
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      volunteer: { select: { id: true } },
      request: {
        include: {
          ngo: { select: { id: true } },
          foodListing: { include: { donor: { select: { id: true } } } },
        },
      },
    },
  });

  if (!delivery) {
    const err = new Error('Delivery not found');
    err.statusCode = 404;
    throw err;
  }
  if (delivery.status !== 'DELIVERED') {
    const err = new Error('Can only rate after delivery is completed');
    err.statusCode = 400;
    throw err;
  }

  const involvedIds = [
    delivery.volunteerId,
    delivery.request.ngo.id,
    delivery.request.foodListing.donor.id,
  ];
  if (!involvedIds.includes(fromUserId)) {
    const err = new Error('Not authorised to rate this delivery');
    err.statusCode = 403;
    throw err;
  }
  if (!involvedIds.includes(toUserId) || toUserId === fromUserId) {
    const err = new Error('Invalid rating target');
    err.statusCode = 400;
    throw err;
  }

  const newRating = await prisma.rating.create({
    data: { fromUserId, toUserId, deliveryId, rating, review },
  });

  // Recalculate avg rating
  const stats = await prisma.rating.aggregate({
    where: { toUserId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.user.update({
    where: { id: toUserId },
    data: {
      avgRating: stats._avg.rating || 0,
      ratingCount: stats._count.rating,
    },
  });

  await notificationService.createNotification({
    userId: toUserId,
    title: 'New Rating',
    message: `You received a ${rating}-star rating`,
    type: 'RATING_RECEIVED',
    data: { ratingId: newRating.id, rating },
  });

  return newRating;
};

const getUserRatings = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { id: true, name: true, role: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rating.count({ where: { toUserId: userId } }),
  ]);
  return { ratings, total };
};

module.exports = { submitRating, getUserRatings };
