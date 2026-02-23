const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { 
  loginLimiter, 
  registerLimiter, 
  validateRegistration, 
  validateLogin, 
  checkIPBlock 
} = require('../middleware/security');

// Email verification routes (for Non-IIIT users)
router.post('/send-verification', registerLimiter, authController.sendEmailVerification);
router.post('/verify-email', authController.verifyEmail);

// Public routes with security middleware
router.post('/register', registerLimiter, validateRegistration, authController.register);
router.post('/login', loginLimiter, checkIPBlock, validateLogin, authController.login);
// Public: list organizers for onboarding
router.get('/organizers', authController.listOrganizersPublic);

// Public: request password reset (for organizers)
router.post('/request-password-reset', authController.requestPasswordReset);

// Protected: get organizer's own reset history
router.get('/my-reset-history', verifyToken, authController.getMyResetHistory);

// Protected routes (require authentication)
router.get('/me', verifyToken, authController.getMe);
router.post('/logout', verifyToken, authController.logout);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/change-password', verifyToken, authController.changePassword);

// Password change with OTP verification
router.post('/request-password-change', verifyToken, authController.requestPasswordChange);
router.post('/verify-password-otp', verifyToken, authController.verifyPasswordOTP);
router.post('/change-password-with-otp', verifyToken, authController.changePasswordWithOTP);

module.exports = router;
