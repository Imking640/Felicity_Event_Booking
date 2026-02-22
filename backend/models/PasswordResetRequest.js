const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  organizerName: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  adminComment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'closed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Index for efficient queries
passwordResetRequestSchema.index({ status: 1, createdAt: -1 });
passwordResetRequestSchema.index({ organizer: 1 });

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
