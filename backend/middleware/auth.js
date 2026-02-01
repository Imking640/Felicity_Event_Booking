const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Verify JWT token and attach user to request
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (without password)
    req.user = await User.findById(decoded.id).select('-password');
    
    // Check if user exists and is active
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is a participant
exports.isParticipant = (req, res, next) => {
  if (req.user && req.user.role === 'participant') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Participants only.'
    });
  }
};

// Check if user is an organizer
exports.isOrganizer = (req, res, next) => {
  if (req.user && req.user.role === 'organizer') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizers only.'
    });
  }
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.'
    });
  }
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
    
    next();
  } catch (error) {
    // Continue without user if token invalid
    next();
  }
};
