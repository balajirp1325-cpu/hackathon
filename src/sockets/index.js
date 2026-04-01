const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.userId}`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Volunteers can join a global delivery room
    if (socket.userRole === 'VOLUNTEER') {
      socket.join('volunteers');
    }

    // NGOs can join a global NGO room
    if (socket.userRole === 'NGO') {
      socket.join('ngos');
    }

    socket.on('join_location_room', ({ city }) => {
      if (city) {
        socket.join(`location:${city.toLowerCase()}`);
        logger.debug(`User ${socket.userId} joined location room: ${city}`);
      }
    });

    socket.on('leave_location_room', ({ city }) => {
      if (city) socket.leave(`location:${city.toLowerCase()}`);
    });

    // Volunteer broadcasts live location during delivery
    socket.on('update_location', ({ deliveryId, lat, lng }) => {
      if (socket.userRole === 'VOLUNTEER' && deliveryId) {
        io.to(`delivery:${deliveryId}`).emit('volunteer_location', { deliveryId, lat, lng });
      }
    });

    socket.on('track_delivery', ({ deliveryId }) => {
      if (deliveryId) socket.join(`delivery:${deliveryId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
