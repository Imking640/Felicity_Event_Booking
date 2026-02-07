const mongoose = require('mongoose');

// Event Schema - Handles both Normal Events and Merchandise
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  eventDescription: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  eventType: {
    type: String,
    enum: ['Normal', 'Merchandise'],
    default: 'Normal',
    required: [true, 'Event type is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  
  // Dates
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  eventStartDate: {
    type: Date,
    required: [true, 'Event start date is required']
  },
  eventEndDate: {
    type: Date,
    required: [true, 'Event end date is required'],
    validate: {
      validator: function(value) {
        return value >= this.eventStartDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  
  // Eligibility and Limits
  eligibility: {
    type: String,
    enum: ['IIIT Only', 'Non-IIIT Only', 'All'],
    default: 'All'
  },
  registrationLimit: {
    type: Number,
    default: null,  // null means unlimited
    min: [1, 'Registration limit must be at least 1']
  },
  currentRegistrations: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Pricing
  registrationFee: {
    type: Number,
    default: 0,
    min: [0, 'Fee cannot be negative']
  },
  
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  
  // Event Status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Event Image
  eventImage: {
    type: String,  // URL or path to image
    default: null
  },
  
  // For Normal Events - Custom Registration Form
  customForm: {
    type: [{
      fieldName: {
        type: String,
        required: true,
        trim: true
      },
      fieldType: {
        type: String,
        enum: ['text', 'textarea', 'number', 'email', 'phone', 'dropdown', 'checkbox', 'file'],
        required: true
      },
      options: [String],  // For dropdown/checkbox
      isRequired: {
        type: Boolean,
        default: false
      },
      placeholder: String,
      order: {
        type: Number,
        default: 0
      }
    }],
    default: undefined
  },
  formLocked: {
    type: Boolean,
    default: false  // Lock form after first registration
  },
  
  // For Merchandise Events
  merchandiseDetails: {
    itemType: {
      type: String,
      trim: true
    },
    variants: [{
      name: String,  // e.g., "Size", "Color"
      options: [String]  // e.g., ["S", "M", "L", "XL"]
    }],
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0
    },
    purchaseLimit: {
      type: Number,
      default: 5,
      min: 1
    }
  },
  
  // Analytics
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAttendance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: null
  }
});

// Index for faster queries
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ eventType: 1, status: 1 });
eventSchema.index({ eventStartDate: 1 });
eventSchema.index({ tags: 1 });

// Update timestamp on save
eventSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    now <= this.registrationDeadline &&
    (this.registrationLimit === null || this.currentRegistrations < this.registrationLimit) &&
    (this.eventType !== 'Merchandise' || this.merchandiseDetails.stockQuantity > 0)
  );
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (this.registrationLimit === null) return false;
  return this.currentRegistrations >= this.registrationLimit;
});

// Method to check if user is eligible
eventSchema.methods.canUserRegister = function(user) {
  // Check if registration is open
  if (!this.isRegistrationOpen) {
    return { allowed: false, reason: 'Registration is not open for this event' };
  }
  
  // Check event status
  if (this.status !== 'published') {
    return { allowed: false, reason: 'Event is not published yet' };
  }
  
  // Check registration deadline
  if (new Date() > this.registrationDeadline) {
    return { allowed: false, reason: 'Registration deadline has passed' };
  }
  
  // Check if event is full
  if (this.registrationLimit && this.currentRegistrations >= this.registrationLimit) {
    return { allowed: false, reason: 'Event has reached maximum registrations' };
  }
  
  // Check eligibility based on participant type
  if (this.eligibility !== 'All') {
    if (!user.participantType) {
      return { allowed: false, reason: 'Only participants can register for events' };
    }
    
    if (this.eligibility === 'IIIT Only' && user.participantType !== 'IIIT') {
      return { allowed: false, reason: 'This event is only for IIIT students' };
    }
    
    if (this.eligibility === 'Non-IIIT Only' && user.participantType !== 'Non-IIIT') {
      return { allowed: false, reason: 'This event is only for Non-IIIT students' };
    }
  }
  
  // For merchandise, check stock
  if (this.eventType === 'Merchandise' && this.merchandiseDetails.stockQuantity <= 0) {
    return { allowed: false, reason: 'Item is out of stock' };
  }
  
  return { allowed: true, reason: '' };
};

// Method to increment registration count
eventSchema.methods.incrementRegistrations = async function() {
  this.currentRegistrations += 1;
  await this.save();
};

// Method to decrement registration count
eventSchema.methods.decrementRegistrations = async function() {
  if (this.currentRegistrations > 0) {
    this.currentRegistrations -= 1;
    await this.save();
  }
};

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
