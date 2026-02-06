const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getAllOrganizers,
  createOrganizer,
  removeOrganizer,
  restoreOrganizer,
  resetOrganizerPassword,
  getDashboardStats,
  getPasswordResetRequests,
  completePasswordResetRequest,
  closePasswordResetRequest
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(verifyToken, isAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Organizer management
router.get('/organizers', getAllOrganizers);
router.post('/organizers', createOrganizer);
router.delete('/organizers/:id', removeOrganizer);
router.put('/organizers/:id/restore', restoreOrganizer);
router.post('/organizers/:id/reset-password', resetOrganizerPassword);

// Password reset requests management
router.get('/password-reset-requests', getPasswordResetRequests);
router.post('/password-reset-requests/:id/reset', completePasswordResetRequest);
router.post('/password-reset-requests/:id/close', closePasswordResetRequest);

module.exports = router;
