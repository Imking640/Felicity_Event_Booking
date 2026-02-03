const { User, Participant, Organizer, Admin } = require('../models/User');
const validator = require('validator');

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
      interests 
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !participantType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // For IIIT participants, validate email domain
    if (participantType === 'IIIT') {
      if (!email.endsWith('@iiit.ac.in') && !email.endsWith('@students.iiit.ac.in')) {
        return res.status(400).json({
          success: false,
          message: 'IIIT participants must use IIIT email address'
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
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
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
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = user.generateToken();
    
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
