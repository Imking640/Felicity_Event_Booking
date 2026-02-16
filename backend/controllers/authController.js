const { User, Participant, Organizer, Admin } = require('../models/User');
const validator = require('validator');
const { verifyEmailExists, verifyRecaptcha, recordFailedLogin, resetFailedLogin, sendVerificationEmail, verifyEmailCode, sendPasswordChangeOTP, verifyPasswordChangeOTP, isPasswordOTPVerified, clearPasswordChangeOTP } = require('../middleware/security');

// @desc    Send email verification code
// @route   POST /api/auth/send-verification
// @access  Public
exports.sendEmailVerification = async (req, res) => {
  try {
    const { email, participantType } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // IIIT student email validation
    if (participantType === 'IIIT') {
      const iiitEmailRegex = /^[a-zA-Z0-9._%+-]+@(students\.iiit\.ac\.in|iiit\.ac\.in|research\.iiit\.ac\.in)$/i;
      if (!iiitEmailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'IIIT students must use their official IIIT email (@students.iiit.ac.in, @iiit.ac.in, or @research.iiit.ac.in)'
        });
      }
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Send verification email
    const result = await sendVerificationEmail(email);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        skipVerification: result.skipVerification || false
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// @desc    Verify email code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const result = verifyEmailCode(email, code);

    if (result.valid) {
      res.json({
        success: true,
        message: result.message,
        verified: true
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        verified: false
      });
    }
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// @desc    Register a new participant
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      participantType,
      college,
      contactNumber,
      interests,
      recaptchaToken,
      emailVerified 
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !participantType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the CAPTCHA verification'
      });
    }

    const captchaResult = await verifyRecaptcha(recaptchaToken);
    if (!captchaResult.success) {
      console.warn(`⚠️ Failed CAPTCHA attempt from ${req.ip} for email ${email}`);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed. Please try again.'
      });
    }
    
    // For IIIT participants, validate email domain - MUST end with .iiit.ac.in
    if (participantType === 'IIIT') {
      if (!email.endsWith('.iiit.ac.in')) {
        return res.status(400).json({
          success: false,
          message: 'IIIT participants must use email ending with .iiit.ac.in (e.g., @students.iiit.ac.in)'
        });
      }
    } else {
      // For Non-IIIT participants, verify email is valid
      const emailVerification = await verifyEmailExists(email);
      if (!emailVerification.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address. Please provide a valid email.'
        });
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create participant
    const participant = await Participant.create({
      email,
      password,
      role: 'participant',
      firstName,
      lastName,
      participantType,
      college: participantType === 'Non-IIIT' ? college : 'IIIT Hyderabad',
      contactNumber,
      interests: interests || []
    });
    
    // Generate token
    const token = participant.generateToken();
    
    // Log successful registration
    console.log(`✅ New registration: ${email} (${participantType}) from IP ${req.ip}`);
    
    // Return response (exclude password)
    const participantData = participant.toObject();
    delete participantData.password;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: participantData
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user (all roles)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the CAPTCHA verification'
      });
    }

    const captchaResult = await verifyRecaptcha(recaptchaToken);
    if (!captchaResult.success) {
      console.warn(`⚠️ Failed CAPTCHA login attempt from ${req.ip} for email ${email}`);
      recordFailedLogin(req.ip, email);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed. Please try again.'
      });
    }
    
    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      recordFailedLogin(req.ip, email);
      console.warn(`⚠️ Failed login attempt for non-existent user: ${email} from IP ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact admin.'
      });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      recordFailedLogin(req.ip, email);
      console.warn(`⚠️ Failed login attempt for ${email} from IP ${req.ip} - Wrong password`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = user.generateToken();
    
    // Reset failed login attempts on successful login
    resetFailedLogin(req.ip, email);
    console.log(`✅ Successful login: ${email} (${user.role}) from IP ${req.ip}`);
    
    // Return response (exclude password)
    const userData = user.toObject();
    delete userData.password;
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // JWT is stateless, so we just return success
    // Client should delete the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    
    // Participant updates
    if (req.user.role === 'participant') {
      const allowedFields = ['firstName', 'lastName', 'contactNumber', 'college', 'interests', 'followedClubs'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }
    
    // Organizer updates
    if (req.user.role === 'organizer') {
      const allowedFields = ['organizerName', 'category', 'description', 'contactEmail', 'contactNumber', 'discordWebhook'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
};

// @desc    Public list of organizers (id, name, category)
// @route   GET /api/auth/organizers
// @access  Public
exports.listOrganizersPublic = async (req, res) => {
  try {
    const organizers = await Organizer.find({ isApproved: true, isActive: true })
      .select('organizerName category');

    res.json({
      success: true,
      organizers
    });
  } catch (error) {
    console.error('List organizers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizers',
      error: error.message
    });
  }
};

// @desc    Change password (authenticated)
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }
    const { User } = require('../models/User');
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
};

// @desc    Request OTP for password change
// @route   POST /api/auth/request-password-change
// @access  Private
exports.requestPasswordChange = async (req, res) => {
  try {
    const result = await sendPasswordChangeOTP(req.user.id, req.user.email);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Request password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// @desc    Verify OTP for password change
// @route   POST /api/auth/verify-password-otp
// @access  Private
exports.verifyPasswordOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }
    
    const result = verifyPasswordChangeOTP(req.user.id, otp);
    
    if (result.valid) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Verify password OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// @desc    Change password with verified OTP
// @route   POST /api/auth/change-password-with-otp
// @access  Private
exports.changePasswordWithOTP = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    
    if (!otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'OTP and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Verify OTP is valid
    if (!isPasswordOTPVerified(req.user.id)) {
      // Try to verify it now
      const verifyResult = verifyPasswordChangeOTP(req.user.id, otp);
      if (!verifyResult.valid) {
        return res.status(400).json({ success: false, message: verifyResult.message });
      }
    }
    
    // Change password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    // Clear OTP
    clearPasswordChangeOTP(req.user.id);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password with OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// @desc    Request password reset (for organizers who forgot password)
// @route   POST /api/auth/request-password-reset
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find organizer by email
    const organizer = await Organizer.findOne({ email, role: 'organizer' });
    
    if (!organizer) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an organizer account exists with this email, a password reset request has been submitted.'
      });
    }
    
    // Check if there's already a pending request
    const PasswordResetRequest = require('../models/PasswordResetRequest');
    const existingRequest = await PasswordResetRequest.findOne({
      organizer: organizer._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A password reset request is already pending for this account. Please wait for admin to process it.'
      });
    }
    
    // Create new password reset request
    await PasswordResetRequest.create({
      organizer: organizer._id,
      email: organizer.email,
      organizerName: organizer.organizerName,
      reason: reason || 'Forgot password'
    });
    
    console.log(`🔑 Password reset request submitted for organizer: ${organizer.email}`);
    
    res.json({
      success: true,
      message: 'Password reset request submitted. Admin will process it shortly.'
    });
    
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit password reset request',
      error: error.message
    });
  }
};
