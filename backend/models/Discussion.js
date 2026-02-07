const mongoose = require('mongoose');

// Reaction Schema for messages
const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['👍', '❤️', '😂', '😮', '😢', '🎉'],
    required: true
  }
}, { _id: false });

// Discussion Message Schema
const messageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['message', 'announcement', 'question'],
    default: 'message'
  },
  // For threading - reference to parent message
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion.messages',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  reactions: [reactionSchema],
  isPinned: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: Date,
  editedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main Discussion Forum Schema
const discussionSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true
  },
  messages: [messageSchema],
  isEnabled: {
    type: Boolean,
    default: true
  },
  // Settings
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: false
    },
    requireRegistration: {
      type: Boolean,
      default: true  // Only registered participants can post
    },
    moderationEnabled: {
      type: Boolean,
      default: false  // Auto-approve messages
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
discussionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for faster queries (event index already created by unique: true)
discussionSchema.index({ 'messages.createdAt': -1 });
discussionSchema.index({ 'messages.isPinned': 1 });

// Virtual for message count
discussionSchema.virtual('messageCount').get(function() {
  return this.messages.filter(m => !m.isDeleted).length;
});

// Method to get messages with pagination
discussionSchema.methods.getMessages = function(page = 1, limit = 50) {
  const messages = this.messages
    .filter(m => !m.isDeleted)
    .sort((a, b) => {
      // Pinned messages first, then by date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  
  const startIndex = (page - 1) * limit;
  return messages.slice(startIndex, startIndex + limit);
};

module.exports = mongoose.model('Discussion', discussionSchema);
