const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { createTicket } = require('../utils/qrGenerator');
const { sendTicketEmail } = require('../utils/emailService');

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Participant only)
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user can register
    const canRegister = event.canUserRegister(req.user);
    if (!canRegister.allowed) {
      return res.status(400).json({
        success: false,
        message: canRegister.reason
      });
    }
    
    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      event: event._id,
      participant: req.user.id
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }
    
    // Normalize body to avoid undefined access when Content-Type isn't JSON
    const body = req.body || {};

    // Prepare registration data
    const registrationData = {
      event: event._id,
      participant: req.user.id,
      customFormData: body.customFormData || {},
      teamName: body.teamName,
      teamMembers: body.teamMembers
    };
    
    // Handle merchandise-specific fields
    if (event.eventType === 'Merchandise') {
      if (!body.merchandiseDetails) {
        return res.status(400).json({
          success: false,
          message: 'Merchandise details are required for merchandise events'
        });
      }
      
      registrationData.merchandiseDetails = body.merchandiseDetails;
      
      // Check stock availability
      const requestedQuantity = body.merchandiseDetails.quantity || 1;
      if (event.merchandiseDetails.stockQuantity < requestedQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }
    }
    
    // Validate custom form data (schema uses fieldName and isRequired)
    if (event.customForm && event.customForm.length > 0) {
      const customData = body.customFormData || {};
      for (const field of event.customForm) {
        const name = field.fieldName || field.name; // backward compatibility
        const required = typeof field.isRequired === 'boolean' ? field.isRequired : field.required;
        if (required && !customData[name]) {
          return res.status(400).json({
            success: false,
            message: `Field "${name}" is required`
          });
        }
      }
    }
    
    // Create registration
    const registration = await Registration.create(registrationData);
    
    // Increment registration count
    await event.incrementRegistrations();
    
    // Merchandise with payment: requires payment proof approval before ticket
    if (event.eventType === 'Merchandise' && event.registrationFee > 0) {
      // Don't decrement stock yet - wait for payment approval
      // Registration stays pending until payment approved
      registration.status = 'pending';
      registration.paymentStatus = 'pending';
      await registration.save();
      
      return res.status(201).json({
        success: true,
        message: 'Order placed! Please upload payment proof for approval.',
        registration,
        requiresPaymentProof: true
      });
    }
    
    // Merchandise with no fee: auto-confirm
    if (event.eventType === 'Merchandise' && event.registrationFee === 0) {
      const qty = (registration.merchandiseDetails && registration.merchandiseDetails.quantity) ? registration.merchandiseDetails.quantity : 1;
      // Decrement stock
      event.merchandiseDetails.stockQuantity = Math.max(0, (event.merchandiseDetails.stockQuantity || 0) - qty);
      await event.save();
      // Confirm immediately
      registration.paymentStatus = 'paid';
      registration.status = 'confirmed';
      await registration.save();

      // Generate and send ticket
      try {
        const ticket = await createTicket(registration._id, event._id, req.user.id, event.eventEndDate);
        await sendTicketEmail(
          req.user.email,
          req.user.firstName || 'Participant',
          event,
          ticket
        );
        return res.status(201).json({
          success: true,
          message: 'Order confirmed! Ticket sent to your email.',
          registration,
          ticket
        });
      } catch (ticketError) {
        console.error('Ticket generation error:', ticketError);
        return res.status(201).json({
          success: true,
          message: 'Order confirmed! Ticket will be sent shortly.',
          registration
        });
      }
    }

    // Normal events with payment: requires payment proof approval before ticket
    if (event.eventType === 'Normal' && event.registrationFee > 0) {
      // Registration stays pending until payment approved
      registration.status = 'pending';
      registration.paymentStatus = 'pending';
      await registration.save();
      
      return res.status(201).json({
        success: true,
        message: 'Registration placed! Please upload payment proof for approval.',
        registration,
        requiresPaymentProof: true
      });
    }

    // Normal free events: auto-confirm
    if (event.registrationFee === 0) {
      registration.paymentStatus = 'paid';
      registration.status = 'confirmed';
      await registration.save();

      try {
        const ticket = await createTicket(registration._id, event._id, req.user.id, event.eventEndDate);
        await sendTicketEmail(
          req.user.email,
          req.user.firstName || 'Participant',
          event,
          ticket
        );
        return res.status(201).json({
          success: true,
          message: 'Registration successful! Ticket sent to your email.',
          registration,
          ticket
        });
      } catch (ticketError) {
        console.error('Ticket generation error:', ticketError);
        return res.status(201).json({
          success: true,
          message: 'Registration successful! Ticket will be sent shortly.',
          registration
        });
      }
    }

    // Fallback for any other paid events: pending until payment
    registration.status = 'pending';
    registration.paymentStatus = 'pending';
    await registration.save();
    
    return res.status(201).json({
      success: true,
      message: 'Registration created. Please upload payment proof for approval.',
      registration,
      requiresPaymentProof: true
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations
// @access  Private (Participant)
exports.getMyRegistrations = async (req, res) => {
  try {
    const { status, type, upcoming, completed, includeTicket } = req.query;

    // Base query
    let registrations = await Registration.find({ participant: req.user.id })
      .populate('event', 'eventName eventType eventStartDate eventEndDate location eventImage status organizer')
      .sort('-registrationDate');

    // In-memory filters based on populated event
    const now = new Date();
    registrations = registrations.filter(reg => {
      const ev = reg.event;
      if (!ev) return false; // safety
      // Filter by registration status
      if (status) {
        const statuses = String(status).split(',');
        if (!statuses.includes(reg.status)) return false;
      }
      // Filter by event type
      if (type && ev.eventType !== type) return false;
      // Upcoming filter
      if (String(upcoming) === 'true') {
        if (!(ev.status === 'published' || ev.status === 'ongoing')) return false;
        if (new Date(ev.eventStartDate) < now) return false;
      }
      // Completed filter
      if (String(completed) === 'true') {
        if (ev.status !== 'completed') return false;
      }
      return true;
    });

    // Optionally include ticketId for quick linking
    if (String(includeTicket) === 'true' && registrations.length) {
      const Ticket = require('../models/Ticket');
      const withTickets = await Promise.all(registrations.map(async reg => {
        const ticket = await Ticket.findOne({ registration: reg._id }).select('ticketId');
        const obj = reg.toObject();
        obj.ticketId = ticket ? ticket.ticketId : null;
        return obj;
      }));
      registrations = withTickets;
    }

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};

// @desc    Get participation summary grouped by categories
// @route   GET /api/registrations/summary
// @access  Private (Participant)
exports.getParticipationSummary = async (req, res) => {
  try {
    const regs = await Registration.find({ participant: req.user.id })
      .populate('event', 'eventName eventType eventStartDate eventEndDate location eventImage status organizer')
      .sort('-registrationDate');

    const now = new Date();
    const buckets = {
      upcoming: [],
      normal: [],
      merchandise: [],
      completed: [],
      cancelledRejected: []
    };

    for (const reg of regs) {
      const ev = reg.event;
      if (!ev) continue;
      const obj = reg.toObject();
      // Bucket by type
      if (ev.eventType === 'Merchandise') buckets.merchandise.push(obj);
      else buckets.normal.push(obj);
      // Upcoming
      if ((ev.status === 'published' || ev.status === 'ongoing') && new Date(ev.eventStartDate) >= now) {
        buckets.upcoming.push(obj);
      }
      // Completed
      if (ev.status === 'completed') buckets.completed.push(obj);
      // Cancelled/Rejected
      if (reg.status === 'cancelled' || reg.status === 'rejected') {
        buckets.cancelledRejected.push(obj);
      }
    }

    res.json({ success: true, summary: buckets });
  } catch (error) {
    console.error('Get participation summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary', error: error.message });
  }
};

// @desc    Get registrations for an event (for organizers)
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer - own events only, or Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view registrations for your own events'
      });
    }
    
    const registrations = await Registration.find({ event: event._id })
      .populate('participant', 'firstName lastName email rollNumber interests')
      .sort('-registeredAt');
    
    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations',
      error: error.message
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private (Participant - own registrations)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }
    
    // Check ownership
    if (registration.participant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own registrations'
      });
    }
    
    // Get event to check cancellation policy
    const event = await Event.findById(registration.event);
    
    // Check if event has already started
    if (new Date() >= event.eventStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after event has started'
      });
    }
    
    // Update registration status
    registration.status = 'cancelled';
    await registration.save();
    
    // Decrement registration count
    await event.decrementRegistrations();
    
    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    });
  }
};

// @desc    Upload payment proof
// @route   POST /api/registrations/:id/payment
// @access  Private (Participant - own registrations)
exports.uploadPaymentProof = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event');
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }
    
    // Check ownership
    if (registration.participant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own registrations'
      });
    }
    
    // Check if payment is already completed
    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }
    
  // Normalize body and store payment proof (file path or URL)
  const body = req.body || {};
  registration.paymentProof = body.paymentProof || req.file?.path;
    registration.paymentProofStatus = 'pending';
    registration.paymentProofUploadedAt = Date.now();
    await registration.save();
    
    res.json({
      success: true,
      message: 'Payment proof uploaded. Waiting for organizer approval.',
      registration
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment proof',
      error: error.message
    });
  }
};

// @desc    Get user's tickets
// @route   GET /api/registrations/tickets
// @access  Private (Participant)
exports.getMyTickets = async (req, res) => {
  try {
    const Ticket = require('../models/Ticket');
    const tickets = await Ticket.find({ participant: req.user.id })
      .populate('event', 'eventName eventType eventStartDate eventEndDate location eventImage status organizer')
      .sort('-generatedAt');

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// @desc    Get ticket by registration (own)
// @route   GET /api/registrations/:id/ticket
// @access  Private (Participant)
exports.getRegistrationTicket = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration || registration.participant.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.findOne({ registration: registration._id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Get registration ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket', error: error.message });
  }
};

// @desc    Verify payment (for organizers)
// @route   POST /api/registrations/:id/verify-payment
// @access  Private (Organizer - own events only)
exports.verifyPayment = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('participant', 'email firstName');
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }
    
    // Check if user is the organizer of this event
    if (registration.event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only verify payments for your own events'
      });
    }
    
  const { approved } = req.body || {};
    
    if (approved) {
      registration.paymentStatus = 'paid';
      registration.paymentProofStatus = 'approved';
      registration.status = 'confirmed';
      registration.paymentApprovedAt = Date.now();
      registration.paymentApprovedBy = req.user.id;
      
      // For merchandise, decrement stock
      if (registration.event.eventType === 'Merchandise') {
        const qty = registration.merchandiseDetails?.quantity || 1;
        registration.event.merchandiseDetails.stockQuantity = Math.max(
          0,
          (registration.event.merchandiseDetails.stockQuantity || 0) - qty
        );
        await registration.event.save();
      }
      
      await registration.save();
      
      // Generate and send ticket
      try {
        const ticket = await createTicket(
          registration._id,
          registration.event._id,
          registration.participant._id,
          registration.event.eventEndDate
        );
        
        // Send ticket via email
        await sendTicketEmail(
          registration.participant.email,
          registration.participant.firstName || 'Participant',
          registration.event,
          ticket
        );
        
        return res.json({
          success: true,
          message: 'Payment approved and ticket sent',
          registration,
          ticket
        });
      } catch (ticketError) {
        console.error('Ticket generation error:', ticketError);
        return res.json({
          success: true,
          message: 'Payment approved. Ticket will be sent shortly.',
          registration
        });
      }
    } else {
      registration.paymentProofStatus = 'rejected';
      registration.status = 'rejected';
      await registration.save();
      
      res.json({
        success: true,
        message: 'Payment rejected',
        registration
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// @desc    Get pending payment approvals for organizer's events
// @route   GET /api/registrations/pending-payments
// @access  Private (Organizer)
exports.getPendingPayments = async (req, res) => {
  try {
    // Get all events by this organizer
    const events = await Event.find({ organizer: req.user.id }).select('_id');
    const eventIds = events.map(e => e._id);
    
    // Find registrations with pending payment proofs
    const pendingRegistrations = await Registration.find({
      event: { $in: eventIds },
      paymentProofStatus: 'pending',
      paymentProof: { $ne: null }
    })
      .populate('event', 'eventName eventType registrationFee merchandiseDetails')
      .populate('participant', 'firstName lastName email rollNumber')
      .sort('-paymentProofUploadedAt');
    
    res.json({
      success: true,
      count: pendingRegistrations.length,
      registrations: pendingRegistrations
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payments',
      error: error.message
    });
  }
};

// @desc    Get all payment orders for organizer's events (Merchandise + paid Normal events)
// @route   GET /api/registrations/merchandise-orders
// @access  Private (Organizer)
exports.getMerchandiseOrders = async (req, res) => {
  try {
    // Get all events by this organizer that require payment (Merchandise OR Normal with fee)
    const events = await Event.find({ 
      organizer: req.user.id,
      $or: [
        { eventType: 'Merchandise' },
        { eventType: 'Normal', registrationFee: { $gt: 0 } }
      ]
    }).select('_id');
    const eventIds = events.map(e => e._id);
    
    // Find all registrations for these events
    const registrations = await Registration.find({
      event: { $in: eventIds }
    })
      .populate('event', 'eventName eventType registrationFee merchandiseDetails')
      .populate('participant', 'firstName lastName email rollNumber')
      .populate('paymentApprovedBy', 'organizerName firstName lastName')
      .sort('-registrationDate');
    
    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Get merchandise orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchandise orders',
      error: error.message
    });
  }
};

// @desc    Get all payment submissions (pending/approved/rejected) for an event
// @route   GET /api/events/:id/payment-submissions
// @access  Private (Organizer - own events)
exports.getEventPaymentSubmissions = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view payment submissions for your own events'
      });
    }
    
    const registrations = await Registration.find({
      event: event._id,
      paymentProof: { $ne: null }
    })
      .populate('participant', 'firstName lastName email rollNumber')
      .populate('paymentApprovedBy', 'organizerName')
      .sort('-paymentProofUploadedAt');
    
    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Get payment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment submissions',
      error: error.message
    });
  }
};

// @desc    Scan QR code and mark attendance
// @route   POST /api/tickets/scan
// @access  Private (Organizer)
exports.scanTicket = async (req, res) => {
  try {
    const Ticket = require('../models/Ticket');
    const { ticketId } = req.body || {};
    
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }
    
    // Find ticket
    const ticket = await Ticket.findOne({ ticketId })
      .populate('event')
      .populate('participant', 'firstName lastName email rollNumber')
      .populate('registration');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }
    
    // Check if organizer owns this event
    if (ticket.event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only scan tickets for your own events'
      });
    }
    
    // Check if already used
    if (ticket.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Ticket already scanned',
        scannedAt: ticket.scannedAt,
        scannedBy: ticket.scannedBy,
        duplicate: true
      });
    }
    
    // Check if expired
    if (ticket.status === 'expired' || new Date() > ticket.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Ticket has expired'
      });
    }
    
    // Check if cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket has been cancelled'
      });
    }
    
    // Mark ticket as used
    await ticket.markAsUsed(req.user.id);
    
    // Mark attendance in registration
    const registration = await Registration.findById(ticket.registration);
    if (registration) {
      registration.attended = true;
      registration.attendanceMarkedAt = Date.now();
      registration.attendanceMarkedBy = req.user.id;
      await registration.save();
    }
    
    res.json({
      success: true,
      message: 'Attendance marked successfully',
      ticket,
      participant: ticket.participant
    });
  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan ticket',
      error: error.message
    });
  }
};

// @desc    Manual attendance override
// @route   POST /api/events/:eventId/attendance/:registrationId
// @access  Private (Organizer)
exports.manualAttendanceOverride = async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const { attended, reason } = req.body || {};
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if organizer owns this event
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only manage attendance for your own events'
      });
    }
    
    const registration = await Registration.findById(registrationId)
      .populate('participant', 'firstName lastName email');
    
    if (!registration || registration.event.toString() !== eventId) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found for this event'
      });
    }
    
    registration.attended = attended;
    registration.attendanceMarkedAt = Date.now();
    registration.attendanceMarkedBy = req.user.id;
    
    // Add audit log to registration (optional field)
    if (!registration.attendanceAuditLog) {
      registration.attendanceAuditLog = [];
    }
    registration.attendanceAuditLog.push({
      action: attended ? 'marked_present' : 'marked_absent',
      by: req.user.id,
      at: Date.now(),
      reason: reason || 'Manual override',
      method: 'manual'
    });
    
    await registration.save();
    
    res.json({
      success: true,
      message: `Attendance ${attended ? 'marked' : 'removed'} for ${registration.participant.firstName} ${registration.participant.lastName}`,
      registration
    });
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance',
      error: error.message
    });
  }
};

// @desc    Get attendance dashboard for an event
// @route   GET /api/events/:id/attendance
// @access  Private (Organizer)
exports.getEventAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if organizer owns this event
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view attendance for your own events'
      });
    }
    
    const registrations = await Registration.find({
      event: event._id,
      status: 'confirmed'
    })
      .populate('participant', 'firstName lastName email rollNumber')
      .populate('attendanceMarkedBy', 'organizerName')
      .sort('participant.firstName');
    
    const stats = {
      totalRegistered: registrations.length,
      attended: registrations.filter(r => r.attended).length,
      notAttended: registrations.filter(r => !r.attended).length,
      attendanceRate: registrations.length > 0 
        ? ((registrations.filter(r => r.attended).length / registrations.length) * 100).toFixed(2) 
        : 0
    };
    
    res.json({
      success: true,
      stats,
      registrations
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

// @desc    Export attendance report as CSV
// @route   GET /api/events/:id/attendance/export
// @access  Private (Organizer)
exports.exportAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if organizer owns this event
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only export attendance for your own events'
      });
    }
    
    const registrations = await Registration.find({
      event: event._id,
      status: 'confirmed'
    })
      .populate('participant', 'firstName lastName email rollNumber')
      .sort('participant.firstName');
    
    // Create CSV content
    let csv = 'First Name,Last Name,Email,Roll Number,Attended,Attendance Marked At\n';
    
    registrations.forEach(reg => {
      const participant = reg.participant;
      csv += `${participant.firstName || ''},${participant.lastName || ''},${participant.email || ''},${participant.rollNumber || ''},${reg.attended ? 'Yes' : 'No'},${reg.attendanceMarkedAt ? new Date(reg.attendanceMarkedAt).toLocaleString() : ''}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${event.eventName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export attendance',
      error: error.message
    });
  }
};
