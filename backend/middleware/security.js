const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Log suspicious activity
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip} - Login attempts`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip} - Registration attempts`);
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Please try again after 1 hour.',
      retryAfter: '1 hour'
    });
  }
});

// Email validation rules
const validateEmail = (participantType) => {
  return [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .custom((email, { req }) => {
        // For IIIT participants, check domain
        if (participantType === 'IIIT' || req.body.participantType === 'IIIT') {
          if (!email.endsWith('.iiit.ac.in')) {
            throw new Error('IIIT participants must use email ending with .iiit.ac.in');
          }
        }
        return true;
      })
  ];
};

// Store verification codes (in production, use Redis or database)
const verificationCodes = new Map();
// Store password change OTPs
const passwordChangeOTPs = new Map();

// Clean up expired codes every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (now - value.createdAt > 10 * 60 * 1000) { // 10 minutes expiry
      verificationCodes.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email to check if email is real
const sendVerificationEmail = async (email) => {
  try {
    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️ Email service not configured (BREVO_API_KEY missing).');
      return { success: false, message: 'Email service not configured. Please contact administrator.' };
    }

    // Generate verification code
    const code = generateVerificationCode();
    
    // Store the code
    verificationCodes.set(email.toLowerCase(), {
      code,
      createdAt: Date.now(),
      attempts: 0
    });

    // Send via Brevo HTTP API (more reliable than SMTP on cloud platforms)
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: 'Felicity Events',
        email: process.env.EMAIL_FROM || 'noreply@felicity.com'
      },
      to: [{ email: email }],
      subject: '🔐 Email Verification Code - Felicity Events',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; }
            .container { max-width: 500px; margin: 0 auto; padding: 30px; }
            .header { background: linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%); 
                     padding: 20px; text-align: center; border-radius: 15px 15px 0 0; }
            .content { background: #16213e; padding: 30px; border-radius: 0 0 15px 15px; }
            .code-box { background: #0f3460; padding: 20px; margin: 20px 0; 
                       border: 2px solid #00ffff; border-radius: 10px; text-align: center; }
            .code { font-size: 36px; font-weight: bold; color: #ffff00; letter-spacing: 8px; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ FELICITY ⚡</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Your verification code for Felicity Events registration is:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>© 2026 Felicity - IIIT Hyderabad</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log(`✅ Verification email sent to ${email} via Brevo API`);
    return { success: true, message: 'Verification code sent to email' };

  } catch (error) {
    console.error('❌ Email sending error:', error.response?.data || error.message);
    
    // Check for specific Brevo errors
    if (error.response?.data?.code === 'invalid_parameter') {
      return { success: false, message: 'Invalid email address' };
    }
    
    return { success: false, message: 'Failed to send verification email. Please try again.' };
  }
};

// Verify the code entered by user
const verifyEmailCode = (email, code) => {
  const stored = verificationCodes.get(email.toLowerCase());
  
  if (!stored) {
    return { valid: false, message: 'No verification code found. Please request a new code.' };
  }
  
  // Check expiry (10 minutes)
  if (Date.now() - stored.createdAt > 10 * 60 * 1000) {
    verificationCodes.delete(email.toLowerCase());
    return { valid: false, message: 'Verification code has expired. Please request a new code.' };
  }
  
  // Check attempts (max 3)
  if (stored.attempts >= 3) {
    verificationCodes.delete(email.toLowerCase());
    return { valid: false, message: 'Too many failed attempts. Please request a new code.' };
  }
  
  // Verify code
  if (stored.code !== code) {
    stored.attempts++;
    return { valid: false, message: `Invalid code. ${3 - stored.attempts} attempts remaining.` };
  }
  
  // Code is valid - mark email as verified
  verificationCodes.delete(email.toLowerCase());
  return { valid: true, message: 'Email verified successfully' };
};

// Legacy function for basic email validation (keep for backward compatibility)
const verifyEmailExists = async (email) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    const domain = email.split('@')[1];
    
    if (domain.includes('iiit.ac.in')) {
      return { valid: true, message: 'IIIT email domain verified' };
    }

    return { valid: true, message: 'Email format valid' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { valid: false, message: 'Email verification failed' };
  }
};

// Verify Google reCAPTCHA v2
const verifyRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('⚠️ RECAPTCHA_SECRET_KEY not set, skipping verification');
      return { success: true, message: 'Captcha verification skipped (dev mode)' };
    }

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );

    if (response.data.success) {
      return { success: true, message: 'Captcha verified' };
    } else {
      return { 
        success: false, 
        message: 'Captcha verification failed',
        errors: response.data['error-codes']
      };
    }
  } catch (error) {
    console.error('Captcha verification error:', error);
    return { success: false, message: 'Captcha verification error' };
  }
};

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  
  body('participantType')
    .isIn(['IIIT', 'Non-IIIT'])
    .withMessage('Participant type must be either IIIT or Non-IIIT'),
  
  body('contactNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid contact number'),
  
  body('recaptchaToken')
    .notEmpty()
    .withMessage('Captcha verification required'),
  
  checkValidation
];

// Login validation middleware
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('recaptchaToken')
    .notEmpty()
    .withMessage('Captcha verification required'),
  
  checkValidation
];

// Track failed login attempts
const failedLoginAttempts = new Map();

// Clean up old entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [key, value] of failedLoginAttempts.entries()) {
    if (value.lastAttempt < oneHourAgo) {
      failedLoginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Check if IP is blocked due to suspicious activity
const checkIPBlock = (req, res, next) => {
  const identifier = req.ip + '-' + (req.body.email || '');
  const attempts = failedLoginAttempts.get(identifier);
  
  if (attempts && attempts.count >= 5) {
    const timeSinceBlock = Date.now() - attempts.lastAttempt;
    const blockDuration = 15 * 60 * 1000; // 15 minutes
    
    if (timeSinceBlock < blockDuration) {
      console.warn(`⚠️ Blocked login attempt from ${req.ip} - Suspicious activity`);
      return res.status(403).json({
        success: false,
        message: 'Account temporarily locked due to suspicious activity. Please try again after 15 minutes.',
        blockedUntil: new Date(attempts.lastAttempt + blockDuration)
      });
    } else {
      // Reset after block duration
      failedLoginAttempts.delete(identifier);
    }
  }
  
  next();
};

// Record failed login attempt
const recordFailedLogin = (ip, email) => {
  const identifier = ip + '-' + email;
  const attempts = failedLoginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  attempts.count++;
  attempts.lastAttempt = Date.now();
  
  failedLoginAttempts.set(identifier, attempts);
  
  if (attempts.count >= 3) {
    console.warn(`⚠️ Multiple failed login attempts for ${email} from IP ${ip}`);
  }
};

// Reset failed login attempts on successful login
const resetFailedLogin = (ip, email) => {
  const identifier = ip + '-' + email;
  failedLoginAttempts.delete(identifier);
};

// Send OTP for password change
const sendPasswordChangeOTP = async (userId, email) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { success: false, message: 'Email service not configured' };
    }

    // Generate OTP
    const otp = generateVerificationCode();
    
    // Store OTP with user ID
    passwordChangeOTPs.set(userId.toString(), {
      otp,
      createdAt: Date.now(),
      attempts: 0,
      verified: false
    });

    // Send via Brevo API
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: 'Felicity Events',
        email: process.env.EMAIL_FROM || 'noreply@felicity.com'
      },
      to: [{ email: email }],
      subject: '🔐 Password Change Verification - Felicity Events',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; }
            .container { max-width: 500px; margin: 0 auto; padding: 30px; }
            .header { background: linear-gradient(135deg, #ff006e 0%, #ff9500 100%); 
                     padding: 20px; text-align: center; border-radius: 15px 15px 0 0; }
            .content { background: #16213e; padding: 30px; border-radius: 0 0 15px 15px; }
            .code-box { background: #0f3460; padding: 20px; margin: 20px 0; 
                       border: 2px solid #ff006e; border-radius: 10px; text-align: center; }
            .code { font-size: 36px; font-weight: bold; color: #ff006e; letter-spacing: 8px; }
            .warning { color: #ffff00; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Change Request</h1>
            </div>
            <div class="content">
              <p>You requested to change your password. Use this OTP to verify:</p>
              <div class="code-box">
                <div class="code">${otp}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p class="warning">⚠️ If you didn't request this, please ignore this email and secure your account.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      timeout: 30000
    });

    console.log(`✅ Password change OTP sent to ${email}`);
    return { success: true, message: 'OTP sent to your email' };

  } catch (error) {
    console.error('❌ Password change OTP error:', error.response?.data || error.message);
    return { success: false, message: 'Failed to send OTP' };
  }
};

// Verify password change OTP
const verifyPasswordChangeOTP = (userId, otp) => {
  const stored = passwordChangeOTPs.get(userId.toString());
  
  if (!stored) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }
  
  // Check expiry (10 minutes)
  if (Date.now() - stored.createdAt > 10 * 60 * 1000) {
    passwordChangeOTPs.delete(userId.toString());
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  // Check attempts (max 3)
  if (stored.attempts >= 3) {
    passwordChangeOTPs.delete(userId.toString());
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  // Verify OTP
  if (stored.otp !== otp) {
    stored.attempts++;
    passwordChangeOTPs.set(userId.toString(), stored);
    return { valid: false, message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.` };
  }
  
  // Mark as verified
  stored.verified = true;
  passwordChangeOTPs.set(userId.toString(), stored);
  
  return { valid: true, message: 'OTP verified successfully' };
};

// Check if OTP is verified for password change
const isPasswordOTPVerified = (userId) => {
  const stored = passwordChangeOTPs.get(userId.toString());
  return stored?.verified === true;
};

// Clear password change OTP after use
const clearPasswordChangeOTP = (userId) => {
  passwordChangeOTPs.delete(userId.toString());
};

// Get security statistics for admin dashboard
const getSecurityStats = () => {
  const now = Date.now();
  const fifteenMinutesAgo = now - (15 * 60 * 1000);
  
  let blockedCount = 0;
  let suspiciousCount = 0;
  const recentAttempts = [];
  
  for (const [key, value] of failedLoginAttempts.entries()) {
    if (value.count >= 5 && value.lastAttempt > fifteenMinutesAgo) {
      blockedCount++;
    }
    if (value.count >= 3) {
      suspiciousCount++;
      const [ip, email] = key.split('-');
      recentAttempts.push({
        ip: ip || 'Unknown',
        email: email || 'Unknown',
        attempts: value.count,
        lastAttempt: new Date(value.lastAttempt),
        isBlocked: value.count >= 5 && value.lastAttempt > fifteenMinutesAgo
      });
    }
  }
  
  // Sort by most recent
  recentAttempts.sort((a, b) => b.lastAttempt - a.lastAttempt);
  
  return {
    blockedIPs: blockedCount,
    suspiciousAttempts: suspiciousCount,
    recentAttempts: recentAttempts.slice(0, 20), // Last 20
    pendingVerifications: verificationCodes.size,
    activeOTPs: passwordChangeOTPs.size
  };
};

module.exports = {
  loginLimiter,
  registerLimiter,
  validateEmail,
  verifyEmailExists,
  verifyRecaptcha,
  validateRegistration,
  validateLogin,
  checkIPBlock,
  recordFailedLogin,
  resetFailedLogin,
  sendVerificationEmail,
  verifyEmailCode,
  sendPasswordChangeOTP,
  verifyPasswordChangeOTP,
  isPasswordOTPVerified,
  clearPasswordChangeOTP,
  getSecurityStats
};
