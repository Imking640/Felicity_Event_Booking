const mongoose = require('mongoose');
const crypto = require('crypto');

// Ticket Schema - Generated tickets with QR codes
const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: [true, 'Registration is required']
  },
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
  
  // QR Code Data
  qrCode: {
    type: String,  // Base64 encoded QR code image
    required: true
  },
  
  // Ticket Status
  status: {
    type: String,
    enum: ['valid', 'used', 'expired', 'cancelled'],
    default: 'valid'
  },
  
  // Usage Information
  scannedAt: {
    type: Date,
    default: null
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Email Sent
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  
  // Timestamps
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Index for faster queries
// ticketId already has unique index from schema definition
ticketSchema.index({ registration: 1 });
ticketSchema.index({ participant: 1 });
ticketSchema.index({ event: 1, status: 1 });

// Static method to generate unique ticket ID
ticketSchema.statics.generateTicketId = function() {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `FEL-${timestamp}-${randomStr}`;
};

// Method to mark ticket as used
ticketSchema.methods.markAsUsed = async function(scannedByUserId) {
  this.status = 'used';
  this.scannedAt = Date.now();
  this.scannedBy = scannedByUserId;
  await this.save();
};

// Method to check if ticket is valid for scanning
ticketSchema.methods.isValidForScanning = function() {
  const now = Date.now();
  return (
    this.status === 'valid' &&
    now < this.expiresAt
  );
};

// Virtual to check if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt;
});

// Ensure virtuals are included in JSON
ticketSchema.set('toJSON', { virtuals: true });
ticketSchema.set('toObject', { virtuals: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
