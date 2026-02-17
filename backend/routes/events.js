const express = require('express');
const router = express.Router();
const { verifyToken, isOrganizer, optionalAuth, isParticipant } = require('../middleware/auth');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent
} = require('../controllers/eventController');
const {
  registerForEvent,
  getEventRegistrations,
  getEventPaymentSubmissions,
  getEventAttendance,
  exportAttendance
} = require('../controllers/registrationController');

// Public routes
router.get('/', optionalAuth, getEvents);  // optionalAuth allows filtering based on user
router.get('/:id', optionalAuth, getEventById);
router.get('/trending/list', optionalAuth, require('../controllers/eventController').getTrendingEvents);

// Protected routes - Organizer only
router.post('/', verifyToken, isOrganizer, createEvent);
router.put('/:id', verifyToken, isOrganizer, updateEvent);
router.delete('/:id', verifyToken, isOrganizer, deleteEvent);
router.post('/:id/publish', verifyToken, isOrganizer, publishEvent);

// Toggle registration open/closed
router.post('/:id/toggle-registration', verifyToken, isOrganizer, async (req, res) => {
  try {
    const Event = require('../models/Event');
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const organizerId = event.organizer._id ? event.organizer._id.toString() : event.organizer.toString();
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    
    if (organizerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    event.registrationClosed = !event.registrationClosed;
    await event.save();
    
    res.json({
      success: true,
      message: event.registrationClosed ? 'Registration closed' : 'Registration reopened',
      registrationClosed: event.registrationClosed
    });
  } catch (error) {
    console.error('Toggle registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle registration' });
  }
});

// Registration routes
router.post('/:id/register', verifyToken, isParticipant, registerForEvent);
router.get('/:id/registrations', verifyToken, isOrganizer, getEventRegistrations);

// Payment Management routes
router.get('/:id/payment-submissions', verifyToken, isOrganizer, getEventPaymentSubmissions);

// Attendance Management routes
router.get('/:id/attendance', verifyToken, isOrganizer, getEventAttendance);
router.get('/:id/attendance/export', verifyToken, isOrganizer, exportAttendance);

module.exports = router;
