const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware Setup
// 1. CORS - Allow frontend to access backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 2. JSON Parser - Parse incoming JSON requests (increased limit for image uploads)
app.use(express.json({ limit: '50mb' }));

// 3. URL Encoded Parser - Parse form data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection Function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('ℹ️  Make sure MongoDB is running or update MONGODB_URI in .env');
    // Don't exit in development if MongoDB isn't running yet
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Connect to MongoDB
connectDB();

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Felicity Event Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/organizers', require('./routes/organizers'));
app.use('/api/discussions', require('./routes/discussions'));
// More routes will be added:
// app.use('/api/participants', require('./routes/participants'));

// Error Handling Middleware
// Catches all errors and sends consistent response
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Export app for testing
module.exports = app;
