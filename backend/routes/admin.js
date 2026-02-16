const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getSecurityStats } = require('../middleware/security');
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

// Security stats
router.get('/security-stats', (req, res) => {
  try {
    const stats = getSecurityStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get security stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get security stats' });
  }
});

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
