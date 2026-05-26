require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const User = require('./models/User');
const Property = require('./models/Property');
const Favorite = require('./models/Favorite');
const Booking = require('./models/Booking');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const aiRoutes = require('./routes/aiRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Serve uploads BEFORE helmet to prevent security headers blocking static files
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, './uploads')));

// Initialize DB Tables
const initDB = async () => {
  try {
    await User.initTable();
    await Property.initTable();
    await Favorite.initTable();
    await Booking.initTable();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
};
initDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5173',                       // local dev (Vite default)
  'http://localhost:3000',                       // local dev alt
  'https://nestfinder30.vercel.app',             // your Vercel URL (update after deploy)
  /https:\/\/nestfinder30.*\.vercel\.app$/,      // covers all Vercel preview URLs
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl, mobile apps
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('/{*path}', cors()); // handle preflight requests — fixed for path-to-regexp v8

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/location-intelligence', intelligenceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NestFinder API' });
});

// Health check route for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
