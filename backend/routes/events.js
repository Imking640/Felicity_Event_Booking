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

// Registration routes
router.post('/:id/register', verifyToken, isParticipant, registerForEvent);
router.get('/:id/registrations', verifyToken, isOrganizer, getEventRegistrations);

// Payment Management routes
router.get('/:id/payment-submissions', verifyToken, isOrganizer, getEventPaymentSubmissions);

// Attendance Management routes
router.get('/:id/attendance', verifyToken, isOrganizer, getEventAttendance);
router.get('/:id/attendance/export', verifyToken, isOrganizer, exportAttendance);

module.exports = router;
