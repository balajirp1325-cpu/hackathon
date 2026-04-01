const prisma = require('../config/database');
const notificationService = require('./notification.service');
const { getIO } = require('../sockets');

const getAvailableDeliveries = async (volunteerId) => {
  // Find accepted requests that don't yet have a delivery
  return prisma.request.findMany({
    where: {
      status: 'ACCEPTED',
      delivery: null,
    },
    include: {
      foodListing: {
        include: { donor: { select: { id: true, name: true, phone: true, address: true } } },
      },
      ngo: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
};

const acceptDelivery = async (volunteerId, requestId) => {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      delivery: true,
      ngo: { select: { id: true, name: true } },
      foodListing: { include: { donor: { select: { id: true, name: true } } } },
    },
  });

  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  if (request.status !== 'ACCEPTED') {
    const err = new Error('Request is not ready for delivery');
    err.statusCode = 400;
    throw err;
  }
  if (request.delivery) {
    const err = new Error('Delivery already assigned');
    err.statusCode = 409;
    throw err;
  }

  const delivery = await prisma.delivery.create({
    data: { volunteerId, requestId },
    include: {
      volunteer: { select: { id: true, name: true, phone: true } },
      request: {
        include: {
          ngo: { select: { id: true, name: true } },
          foodListing: { select: { id: true, title: true } },
        },
      },
    },
  });

  // Notify NGO and donor
  await notificationService.createNotification({
    userId: request.ngo.id,
    title: 'Delivery Assigned',
    message: `${delivery.volunteer.name} will deliver "${request.foodListing.title}" to you`,
    type: 'DELIVERY_ASSIGNED',
    data: { deliveryId: delivery.id },
  });

  return delivery;
};

const updateDeliveryStatus = async (volunteerId, deliveryId, status, currentLat, currentLng) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
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
  if (delivery.volunteerId !== volunteerId) {
    const err = new Error('Not authorised');
    err.statusCode = 403;
    throw err;
  }

  const updateData = { status, currentLat, currentLng };
  if (status === 'PICKED') updateData.pickupTime = new Date();
  if (status === 'DELIVERED') updateData.deliveryTime = new Date();

  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data: updateData,
  });

  // Real-time broadcast
  const io = getIO();
  if (io) {
    const roomTargets = [
      `user:${delivery.request.ngo.id}`,
      `user:${delivery.request.foodListing.donor.id}`,
      `user:${volunteerId}`,
    ];
    roomTargets.forEach((room) => io.to(room).emit('delivery_update', updated));
  }

  // Notify on completion
  if (status === 'DELIVERED') {
    await notificationService.createNotification({
      userId: delivery.request.ngo.id,
      title: 'Delivery Completed',
      message: 'Your food delivery has been completed. Please rate the volunteer.',
      type: 'DELIVERY_COMPLETED',
      data: { deliveryId },
    });
  }

  return updated;
};

const getMyDeliveries = async (volunteerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [deliveries, total] = await Promise.all([
    prisma.delivery.findMany({
      where: { volunteerId },
      include: {
        request: {
          include: {
            ngo: { select: { id: true, name: true, address: true } },
            foodListing: {
              include: { donor: { select: { id: true, name: true, phone: true } } },
            },
          },
        },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.delivery.count({ where: { volunteerId } }),
  ]);
  return { deliveries, total };
};

module.exports = {
  getAvailableDeliveries,
  acceptDelivery,
  updateDeliveryStatus,
  getMyDeliveries,
};
