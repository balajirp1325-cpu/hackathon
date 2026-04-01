const prisma = require('../config/database');
const { filterByRadius } = require('../utils/haversine');
const { deleteImage } = require('../config/cloudinary');
const { getIO } = require('../sockets');
const notificationService = require('./notification.service');

const createListing = async (donorId, data, file) => {
  const imageUrl = file?.path || null;
  const imagePublicId = file?.filename || null;

  const listing = await prisma.foodListing.create({
    data: {
      ...data,
      donorId,
      expiryTime: new Date(data.expiryTime),
      imageUrl,
      imagePublicId,
    },
    include: { donor: { select: { id: true, name: true, phone: true } } },
  });

  // Notify NGOs within 10km
  const nearbyNGOs = await prisma.user.findMany({
    where: { role: 'NGO', isActive: true },
    select: { id: true, latitude: true, longitude: true },
  });

  const withinRadius = filterByRadius(
    nearbyNGOs.filter((n) => n.latitude && n.longitude),
    listing.latitude,
    listing.longitude,
    10
  );

  for (const ngo of withinRadius) {
    await notificationService.createNotification({
      userId: ngo.id,
      title: 'New Food Available',
      message: `${listing.donor.name} has listed "${listing.title}" (${listing.quantity} ${listing.unit}) near you`,
      type: 'NEW_LISTING',
      data: { listingId: listing.id },
    });
  }

  const io = getIO();
  if (io) {
    withinRadius.forEach(({ id }) => {
      io.to(`user:${id}`).emit('new_listing', listing);
    });
  }

  return listing;
};

const getNearbyListings = async (lat, lng, radiusKm = 10, filters = {}) => {
  const where = {
    status: 'AVAILABLE',
    expiryTime: { gt: new Date() },
  };

  if (filters.foodType) where.foodType = filters.foodType;

  const listings = await prisma.foodListing.findMany({
    where,
    include: {
      donor: { select: { id: true, name: true, phone: true, avgRating: true } },
      requests: { where: { status: { in: ['PENDING', 'ACCEPTED'] } }, select: { id: true } },
    },
    orderBy: { expiryTime: 'asc' },
  });

  if (!lat || !lng) return listings;

  return filterByRadius(listings, parseFloat(lat), parseFloat(lng), parseFloat(radiusKm));
};

const getListingById = async (id) => {
  const listing = await prisma.foodListing.findUnique({
    where: { id },
    include: {
      donor: { select: { id: true, name: true, phone: true, address: true, avgRating: true } },
    },
  });
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  return listing;
};

const getMyListings = async (donorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [listings, total] = await Promise.all([
    prisma.foodListing.findMany({
      where: { donorId },
      include: {
        requests: {
          select: { id: true, status: true, ngo: { select: { id: true, name: true } } },
        },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.foodListing.count({ where: { donorId } }),
  ]);
  return { listings, total };
};

const updateListing = async (id, donorId, data) => {
  const listing = await prisma.foodListing.findUnique({ where: { id } });
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  if (listing.donorId !== donorId) {
    const err = new Error('Not authorised to update this listing');
    err.statusCode = 403;
    throw err;
  }
  if (listing.status !== 'AVAILABLE') {
    const err = new Error('Cannot update a claimed or expired listing');
    err.statusCode = 400;
    throw err;
  }
  return prisma.foodListing.update({ where: { id }, data });
};

const deleteListing = async (id, donorId) => {
  const listing = await prisma.foodListing.findUnique({ where: { id } });
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  if (listing.donorId !== donorId) {
    const err = new Error('Not authorised');
    err.statusCode = 403;
    throw err;
  }
  await deleteImage(listing.imagePublicId);
  await prisma.foodListing.delete({ where: { id } });
};

module.exports = {
  createListing,
  getNearbyListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
};
