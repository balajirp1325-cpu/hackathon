const prisma = require('../config/database');
const { filterByRadius } = require('../utils/haversine');
const notificationService = require('./notification.service');

// Simulate cancelled orders from restaurants
const seedCancelledOrders = async () => {
  const sampleOrders = [
    {
      foodName: 'Butter Chicken + Naan (x10)',
      quantity: 10,
      unit: 'portions',
      restaurantName: 'Spice Garden',
      address: '12 MG Road, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      readyTime: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      foodName: 'Veg Biryani',
      quantity: 20,
      unit: 'portions',
      restaurantName: 'The Grand Kitchen',
      address: '45 Brigade Road, Bengaluru',
      latitude: 12.9733,
      longitude: 77.6084,
      readyTime: new Date(),
      expiresAt: new Date(Date.now() + 90 * 60 * 1000),
    },
  ];

  for (const order of sampleOrders) {
    await prisma.cancelledOrder.upsert({
      where: { id: order.restaurantName + order.foodName },
      update: {},
      create: order,
    }).catch(() => prisma.cancelledOrder.create({ data: order }));
  }
};

const getCancelledOrders = async (lat, lng, radiusKm = 15) => {
  const orders = await prisma.cancelledOrder.findMany({
    where: {
      isClaimed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: 'asc' },
  });

  if (!lat || !lng) return orders;
  return filterByRadius(orders, parseFloat(lat), parseFloat(lng), parseFloat(radiusKm));
};

const claimCancelledOrder = async (ngoId, orderId) => {
  const order = await prisma.cancelledOrder.findUnique({ where: { id: orderId } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (order.isClaimed) {
    const err = new Error('Order already claimed');
    err.statusCode = 409;
    throw err;
  }
  if (order.expiresAt < new Date()) {
    const err = new Error('Order has expired');
    err.statusCode = 400;
    throw err;
  }

  return prisma.cancelledOrder.update({
    where: { id: orderId },
    data: { isClaimed: true, claimedById: ngoId },
  });
};

module.exports = { getCancelledOrders, claimCancelledOrder, seedCancelledOrders };
