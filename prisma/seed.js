require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hash = (pw) => bcrypt.hash(pw, 12);

  // Seed users
  const donor = await prisma.user.upsert({
    where: { email: 'donor@foodbridge.dev' },
    update: {},
    create: {
      name: 'Ravi Kumar',
      email: 'donor@foodbridge.dev',
      password: await hash('password123'),
      role: 'DONOR',
      phone: '9876543210',
      latitude: 12.9716,
      longitude: 77.5946,
      address: '10 MG Road, Bengaluru',
    },
  });

  const ngo = await prisma.user.upsert({
    where: { email: 'ngo@foodbridge.dev' },
    update: {},
    create: {
      name: 'Helping Hands NGO',
      email: 'ngo@foodbridge.dev',
      password: await hash('password123'),
      role: 'NGO',
      phone: '9123456780',
      latitude: 12.9352,
      longitude: 77.6245,
      address: '5 HSR Layout, Bengaluru',
    },
  });

  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@foodbridge.dev' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'volunteer@foodbridge.dev',
      password: await hash('password123'),
      role: 'VOLUNTEER',
      phone: '9000011112',
      latitude: 12.9611,
      longitude: 77.6387,
      address: '22 Indiranagar, Bengaluru',
    },
  });

  // Seed a food listing
  const listing = await prisma.foodListing.create({
    data: {
      donorId: donor.id,
      title: 'Dal Makhani + Rice (10 portions)',
      description: 'Freshly cooked, ready for pickup',
      quantity: 10,
      unit: 'portions',
      foodType: 'VEG',
      latitude: 12.9716,
      longitude: 77.5946,
      address: '10 MG Road, Bengaluru',
      expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
      status: 'AVAILABLE',
    },
  });

  // Seed a cancelled order
  await prisma.cancelledOrder.create({
    data: {
      foodName: 'Paneer Butter Masala (15 portions)',
      quantity: 15,
      unit: 'portions',
      restaurantName: 'Hotel Sagar',
      address: '8 Residency Road, Bengaluru',
      latitude: 12.9719,
      longitude: 77.5937,
      readyTime: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  console.log('Seed complete!');
  console.log('\nTest accounts:');
  console.log('  Donor:     donor@foodbridge.dev     / password123');
  console.log('  NGO:       ngo@foodbridge.dev       / password123');
  console.log('  Volunteer: volunteer@foodbridge.dev / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
