require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const requestRoutes = require('./routes/request.routes');
const miscRoutes = require('./routes/misc.routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'FoodBridge API is running', timestamp: new Date() });
});

// Serve static files from food-rescue directory
app.use(express.static(path.join(__dirname, '../food-rescue')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api', miscRoutes);

// Catch all handler: send back index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../food-rescue/index.html'));
});

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
