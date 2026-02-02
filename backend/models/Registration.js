const mongoose = require('mongoose');

// Registration Schema - Tracks event registrations
const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Participant is required']
  },
  
  // Registration Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'rejected', 'completed'],
    default: 'confirmed'
  },
  
  // For Normal Events - Custom Form Data
  customFormData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // For Merchandise - Selected Variants and Quantity
  merchandiseDetails: {
    selectedVariants: {
      type: Map,
      of: String
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentProof: {
    type: String,  // URL or path to uploaded payment proof
    default: null
  },
  paymentProofStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  
  // Team Information (for future team events)
  teamName: {
    type: String,
    trim: true,
    default: null
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  
  // Attendance
  attended: {
    type: Boolean,
    default: false
  },
  attendanceMarkedAt: {
    type: Date,
    default: null
  },
  attendanceMarkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Timestamps
  registrationDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ event: 1, participant: 1 }, { unique: true });

// Index for queries
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ participant: 1, status: 1 });
registrationSchema.index({ registrationDate: -1 });

// Update timestamp on save
registrationSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Virtual to check if registration is active
registrationSchema.virtual('isActive').get(function() {
  return this.status === 'confirmed' || this.status === 'pending';
});

// Ensure virtuals are included in JSON
registrationSchema.set('toJSON', { virtuals: true });
registrationSchema.set('toObject', { virtuals: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
