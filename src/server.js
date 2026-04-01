require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets');
const { startCronJobs } = require('./jobs/expiry.job');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Start cron jobs
startCronJobs();

httpServer.listen(PORT, () => {
  logger.info(`FoodBridge server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});
