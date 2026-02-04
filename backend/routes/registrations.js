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
  verifyPayment
} = require('../controllers/registrationController');

// Participant routes
router.get('/', verifyToken, isParticipant, getMyRegistrations);
router.get('/summary', verifyToken, isParticipant, getParticipationSummary);
router.get('/tickets', verifyToken, isParticipant, getMyTickets);
router.get('/:id/ticket', verifyToken, isParticipant, getRegistrationTicket);
router.delete('/:id', verifyToken, isParticipant, cancelRegistration);
router.post('/:id/payment', verifyToken, isParticipant, uploadPaymentProof);

// Organizer routes
router.post('/:id/verify-payment', verifyToken, isOrganizer, verifyPayment);

module.exports = router;
