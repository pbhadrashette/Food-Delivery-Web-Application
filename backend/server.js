require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { seedDatabase } = require('./seed');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const foodRoutes = require('./routes/foodRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    // Security
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      skip: () => process.env.NODE_ENV !== 'production',
      message: { success: false, message: 'Too many requests. Please try again later.' },
    });
    app.use('/api/', limiter);

    // CORS
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
    ];
    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());

    // Logging
    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('dev'));
    }

    // Static files for uploads
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Health check
    app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is running!', env: process.env.NODE_ENV }));

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/restaurants', restaurantRoutes);
    app.use('/api/foods', foodRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/coupons', couponRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/kitchens', kitchenRoutes);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
    });

    // Centralized error handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
