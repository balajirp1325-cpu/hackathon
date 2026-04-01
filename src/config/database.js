const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent hot-reload from spawning many clients in dev
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

prisma.$connect()
  .then(() => logger.info('Database connected'))
  .catch((err) => {
    logger.error('Database connection failed', err);
    process.exit(1);
  });

module.exports = prisma;
