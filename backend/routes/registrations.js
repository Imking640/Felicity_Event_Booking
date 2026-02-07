const express = require('express');
const router = express.Router();
const { verifyToken, isParticipant, isOrganizer } = require('../middleware/auth');
const {
  getMyRegistrations,
  getMyTickets,
  getRegistrationTicket,
  getParticipationSummary,
  cancelRegistration,
  uploadPaymentProof,
  verifyPayment,
  getPendingPayments,
  getMerchandiseOrders,
  scanTicket,
  manualAttendanceOverride
} = require('../controllers/registrationController');

// Participant routes
router.get('/', verifyToken, isParticipant, getMyRegistrations);
router.get('/summary', verifyToken, isParticipant, getParticipationSummary);
router.get('/tickets', verifyToken, isParticipant, getMyTickets);
router.get('/:id/ticket', verifyToken, isParticipant, getRegistrationTicket);
router.delete('/:id', verifyToken, isParticipant, cancelRegistration);
router.post('/:id/payment', verifyToken, isParticipant, uploadPaymentProof);

// Organizer routes - Payment Management
router.get('/pending-payments', verifyToken, isOrganizer, getPendingPayments);
router.get('/merchandise-orders', verifyToken, isOrganizer, getMerchandiseOrders);
router.post('/:id/verify-payment', verifyToken, isOrganizer, verifyPayment);

// Organizer routes - Attendance Management
router.post('/tickets/scan', verifyToken, isOrganizer, scanTicket);
router.post('/events/:eventId/attendance/:registrationId', verifyToken, isOrganizer, manualAttendanceOverride);

module.exports = router;
