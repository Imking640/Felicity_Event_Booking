const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Base User Schema - Common fields for all user types
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ['participant', 'organizer', 'admin'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    select: false
  },
  emailVerificationOTPExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  discriminatorKey: 'role',  // Field to determine which model to use
  collection: 'users'  // All users in one collection
});

// MIDDLEWARE: Hash password before saving
userSchema.pre('save', async function() {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }
  
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// METHOD: Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// METHOD: Generate JWT token
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Create base User model
const User = mongoose.model('User', userSchema);

// PARTICIPANT MODEL - Extended fields for participants
const participantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  participantType: {
    type: String,
    enum: ['IIIT', 'Non-IIIT'],
    required: true
  },
  college: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Optional field, but if provided, must be valid
        return !v || /^\d{10}$/.test(v);
      },
      message: 'Contact number must be 10 digits'
    }
  },
  interests: [{
    type: String,
    trim: true
  }],
  followedClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer'
  }]
});

const Participant = User.discriminator('participant', participantSchema);

// ORGANIZER MODEL - Extended fields for organizers
const organizerSchema = new mongoose.Schema({
  organizerName: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technical', 'Cultural', 'Sports', 'Gaming', 'Other'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  contactEmail: {
    type: String,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid contact email']
  },
  contactNumber: {
    type: String,
    trim: true
  },
  discordWebhook: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide a valid Discord webhook URL'
    }
  },
  isApproved: {
    type: Boolean,
    default: true  // Admin approves during creation
  }
});

const Organizer = User.discriminator('organizer', organizerSchema);

// ADMIN MODEL - Minimal additional fields
const adminSchema = new mongoose.Schema({
  adminName: {
    type: String,
    default: 'Admin',
    trim: true
  }
});

const Admin = User.discriminator('admin', adminSchema);

// Export all models
module.exports = {
  User,
  Participant,
  Organizer,
  Admin
};
