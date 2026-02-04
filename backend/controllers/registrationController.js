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
    
    // Merchandise: purchase implies registration; decrement stock; confirm and send ticket
    if (event.eventType === 'Merchandise') {
      const qty = (registration.merchandiseDetails && registration.merchandiseDetails.quantity) ? registration.merchandiseDetails.quantity : 1;
      // Decrement stock
      event.merchandiseDetails.stockQuantity = Math.max(0, (event.merchandiseDetails.stockQuantity || 0) - qty);
      await event.save();
      // Confirm immediately (purchase implies registration)
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
          message: 'Purchase successful! Ticket sent to your email.',
          registration,
          ticket
        });
      } catch (ticketError) {
        console.error('Ticket generation error:', ticketError);
        return res.status(201).json({
          success: true,
          message: 'Purchase successful! Ticket will be sent shortly.',
          registration
        });
      }
    }

    // Normal free events: auto-confirm
    if (event.registrationFee === 0 || event.eventType === 'Normal') {
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

    // Paid normal events: pending until payment
    return res.status(201).json({
      success: true,
      message: 'Registration created. Please complete payment to confirm.',
      registration
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
    registration.paymentStatus = 'pending';
    await registration.save();
    
    res.json({
      success: true,
      message: 'Payment proof uploaded. Waiting for verification.',
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
      .populate('event');
    
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
      registration.status = 'confirmed';
      await registration.save();
      
      // Generate and send ticket
      try {
        const ticket = await createTicket(
          registration._id,
          registration.event._id,
          registration.participant,
          registration.event.eventEndDate
        );
        
        // Get participant details
        const participant = await require('../models/User').findById(registration.participant);
        
        // Send ticket via email
        await sendTicketEmail(
          participant.email,
          participant.firstName || 'Participant',
          registration.event,
          ticket
        );
        
        return res.json({
          success: true,
          message: 'Payment verified and ticket sent',
          registration,
          ticket
        });
      } catch (ticketError) {
        console.error('Ticket generation error:', ticketError);
        return res.json({
          success: true,
          message: 'Payment verified. Ticket will be sent shortly.',
          registration
        });
      }
    } else {
      registration.paymentStatus = 'rejected';
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
