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
    default: 'pending'
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
  paymentProofUploadedAt: {
    type: Date,
    default: null
  },
  paymentApprovedAt: {
    type: Date,
    default: null
  },
  paymentApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  
  // Audit Log for attendance changes
  attendanceAuditLog: [{
    action: String, // 'marked_present', 'marked_absent', 'qr_scanned'
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: Date,
    reason: String,
    method: {
      type: String,
      enum: ['manual', 'qr_scan'],
      default: 'manual'
    }
  }],
  
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

// CASCADE DELETE: When a registration is deleted, delete its ticket
registrationSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const registrationId = this._id;
    
    console.log(`🗑️ Cascading delete for registration: ${registrationId}`);
    
    // Import Ticket model
    const Ticket = require('./Ticket');
    
    // Delete ticket associated with this registration
    const ticketDeleteResult = await Ticket.deleteMany({ registration: registrationId });
    console.log(`  ✓ Deleted ${ticketDeleteResult.deletedCount} ticket(s)`);
    
    // Decrement event registration count
    const Event = require('./Event');
    const event = await Event.findById(this.event);
    if (event) {
      await event.decrementRegistrations();
      console.log(`  ✓ Decremented event registration count`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in registration cascade delete:', error);
    next(error);
  }
});

// CASCADE DELETE for bulk operations (deleteMany)
registrationSchema.pre('deleteMany', async function(next) {
  try {
    const filter = this.getFilter();
    console.log(`🗑️ Bulk cascading delete for registrations with filter:`, filter);
    
    // Find all registrations that will be deleted
    const Registration = mongoose.model('Registration');
    const registrations = await Registration.find(filter);
    
    if (registrations.length === 0) {
      console.log('  ℹ️ No registrations to delete');
      return next();
    }
    
    const registrationIds = registrations.map(r => r._id);
    
    // Import Ticket model
    const Ticket = require('./Ticket');
    
    // Delete all tickets for these registrations
    const ticketDeleteResult = await Ticket.deleteMany({ registration: { $in: registrationIds } });
    console.log(`  ✓ Deleted ${ticketDeleteResult.deletedCount} ticket(s)`);
    
    // Update event registration counts
    const Event = require('./Event');
    const eventUpdates = {};
    
    for (const reg of registrations) {
      if (reg.event) {
        eventUpdates[reg.event.toString()] = (eventUpdates[reg.event.toString()] || 0) + 1;
      }
    }
    
    for (const [eventId, count] of Object.entries(eventUpdates)) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { currentRegistrations: -count }
      });
    }
    console.log(`  ✓ Updated registration counts for ${Object.keys(eventUpdates).length} event(s)`);
    
    next();
  } catch (error) {
    console.error('❌ Error in bulk registration cascade delete:', error);
    next(error);
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
