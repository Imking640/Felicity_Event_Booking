const express = require('express');
const router = express.Router();
const { verifyToken, isParticipant, isOrganizer } = require('../middleware/auth');
const {
  getMyRegistrations,
  cancelRegistration,
  uploadPaymentProof,
  verifyPayment
} = require('../controllers/registrationController');

// Participant routes
router.get('/', verifyToken, isParticipant, getMyRegistrations);
router.delete('/:id', verifyToken, isParticipant, cancelRegistration);
router.post('/:id/payment', verifyToken, isParticipant, uploadPaymentProof);

// Organizer routes
router.post('/:id/verify-payment', verifyToken, isOrganizer, verifyPayment);

module.exports = router;
