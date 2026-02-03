const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { createTicket } = require('../utils/qrGenerator');
const { sendTicketEmail } = require('../utils/emailService');

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const {
      type,        // Event type filter
      eligibility, // Eligibility filter
      status,      // Status filter
      organizer,   // Organizer filter
      search,      // Search in name/description
      tags,        // Tags filter
      startDate,   // Filter by start date range
      endDate,
      sortBy = (req.user && req.user.role === 'participant') ? 'relevance' : 'eventStartDate',
      order = 'asc',
      page = 1,
      limit = 20
    } = req.query;
    
    // Build query
    const query = {};
    
    // Apply filters
    if (type) query.eventType = type;
    if (eligibility) query.eligibility = eligibility;
    if (status) {
      query.status = status;
    } else {
      // Default: only show published events for non-organizers
      if (!req.user || req.user.role !== 'organizer') {
        query.status = 'published';
      }
    }
    if (organizer) query.organizer = organizer;
    if (tags) query.tags = { $in: tags.split(',') };
    
    // Date range filter
    if (startDate || endDate) {
      query.eventStartDate = {};
      if (startDate) query.eventStartDate.$gte = new Date(startDate);
      if (endDate) query.eventStartDate.$lte = new Date(endDate);
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { eventDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Always get with basic sort by date for stable ordering before relevance tweaks
    const sortOrder = order === 'desc' ? -1 : 1;
    const baseSort = { eventStartDate: sortOrder };

    // Execute base query
    let events = await Event.find(query)
      .populate('organizer', 'organizerName email category')
      .sort(baseSort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Event.countDocuments(query);

    // Relevance sorting for participants based on interests & followed clubs
    if (sortBy === 'relevance' && req.user && req.user.role === 'participant') {
      try {
        const { Participant } = require('../models/User');
        const me = await Participant.findById(req.user.id).select('interests followedClubs');
        if (me) {
          const interests = new Set((me.interests || []).map(s => s.toLowerCase()));
          const followed = new Set((me.followedClubs || []).map(id => String(id)));
          // Re-fetch without pagination to score correctly, then paginate post-sort
          const allEvents = await Event.find(query)
            .populate('organizer', 'organizerName email category')
            .sort(baseSort);

          const scored = allEvents.map(ev => {
            let score = 0;
            // tag matches
            if (Array.isArray(ev.tags) && interests.size) {
              const hits = ev.tags.filter(t => interests.has(String(t).toLowerCase())).length;
              score += hits * 2;
            }
            // organizer followed
            if (ev.organizer && followed.has(String(ev.organizer._id))) {
              score += 5;
            }
            return { ev, score };
          });

          scored.sort((a, b) => b.score - a.score || new Date(a.ev.eventStartDate) - new Date(b.ev.eventStartDate));
          // apply pagination after relevance sort
          const start = (page - 1) * limit;
          events = scored.slice(start, start + parseInt(limit)).map(s => s.ev);
        }
      } catch (relevanceErr) {
        console.error('Relevance sort error:', relevanceErr);
      }
    }

    res.json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'organizerName email category description contactEmail');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user can view this event
    if (event.status === 'draft') {
      if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Draft events are not public'
        });
      }
      
      // Organizers can only see their own drafts
      if (req.user.role === 'organizer' && event.organizer._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own draft events'
        });
      }
    }
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer only)
exports.createEvent = async (req, res) => {
  try {
    // Add organizer to event data
    const eventData = {
      ...req.body,
      organizer: req.user.id,
      status: 'draft'  // All new events start as draft
    };
    
    // Validate event type specific fields
    if (eventData.eventType === 'Merchandise') {
      if (!eventData.merchandiseDetails || !eventData.merchandiseDetails.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Merchandise events require stock quantity'
        });
      }
    }
    
    // Create event
    const event = await Event.create(eventData);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer - own events only)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own events'
      });
    }
    
    // Check what can be updated based on status
    if (event.status === 'draft') {
      // Draft events can be fully edited
      Object.assign(event, req.body);
    } else if (event.status === 'published') {
      // Published events have limited updates
      const allowedUpdates = [
        'eventDescription',
        'registrationDeadline',
        'registrationLimit',
        'tags'
      ];
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          event[field] = req.body[field];
        }
      });
      
      // Can extend deadline but not shorten it
      if (req.body.registrationDeadline) {
        const newDeadline = new Date(req.body.registrationDeadline);
        if (newDeadline < event.registrationDeadline) {
          return res.status(400).json({
            success: false,
            message: 'Cannot shorten registration deadline for published events'
          });
        }
      }
    } else {
      // Ongoing/Completed events cannot be edited except status
      if (req.body.status) {
        event.status = req.body.status;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit ongoing or completed events'
        });
      }
    }
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer - own events only, or Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own events'
      });
    }
    
    // Can only delete draft events or events with no registrations
    if (event.status !== 'draft' && event.currentRegistrations > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations. Cancel it instead.'
      });
    }
    
    await event.deleteOne();
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// @desc    Publish event (change status from draft to published)
// @route   POST /api/events/:id/publish
// @access  Private (Organizer - own events only)
exports.publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own events'
      });
    }
    
    // Can only publish draft events
    if (event.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft events can be published'
      });
    }
    
    // Validate event has all required fields
    const requiredFields = ['eventName', 'eventDescription', 'registrationDeadline', 'eventStartDate', 'eventEndDate'];
    for (const field of requiredFields) {
      if (!event[field]) {
        return res.status(400).json({
          success: false,
          message: `Cannot publish: ${field} is required`
        });
      }
    }
    
    event.status = 'published';
    event.publishedAt = Date.now();
    await event.save();
    
    res.json({
      success: true,
      message: 'Event published successfully',
      event
    });
  } catch (error) {
    console.error('Publish event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish event',
      error: error.message
    });
  }
};
