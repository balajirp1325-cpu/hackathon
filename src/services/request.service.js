const prisma = require('../config/database');
const notificationService = require('./notification.service');
const { getIO } = require('../sockets');

const claimFood = async (ngoId, foodListingId, notes) => {
  const listing = await prisma.foodListing.findUnique({
    where: { id: foodListingId },
    include: { donor: { select: { id: true, name: true } } },
  });

  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  if (listing.status !== 'AVAILABLE') {
    const err = new Error('This food has already been claimed or expired');
    err.statusCode = 400;
    throw err;
  }
  if (listing.expiryTime < new Date()) {
    const err = new Error('This listing has expired');
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.request.findUnique({
    where: { ngoId_foodListingId: { ngoId, foodListingId } },
  });
  if (existing) {
    const err = new Error('You have already requested this listing');
    err.statusCode = 409;
    throw err;
  }

  const [request] = await prisma.$transaction([
    prisma.request.create({
      data: { ngoId, foodListingId, notes },
      include: {
        ngo: { select: { id: true, name: true } },
        foodListing: true,
      },
    }),
    prisma.foodListing.update({
      where: { id: foodListingId },
      data: { status: 'CLAIMED' },
    }),
  ]);

  // Notify donor
  await notificationService.createNotification({
    userId: listing.donor.id,
    title: 'Food Claimed',
    message: `${request.ngo.name} has claimed your listing "${listing.title}"`,
    type: 'LISTING_CLAIMED',
    data: { requestId: request.id, listingId: foodListingId },
  });

  return request;
};

const getMyRequests = async (ngoId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where: { ngoId },
      include: {
        foodListing: {
          include: { donor: { select: { id: true, name: true, phone: true } } },
        },
        delivery: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.request.count({ where: { ngoId } }),
  ]);
  return { requests, total };
};

const getDonorRequests = async (donorId) => {
  return prisma.request.findMany({
    where: { foodListing: { donorId } },
    include: {
      ngo: { select: { id: true, name: true, phone: true, avgRating: true } },
      foodListing: { select: { id: true, title: true, quantity: true } },
      delivery: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = { claimFood, getMyRequests, getDonorRequests };
