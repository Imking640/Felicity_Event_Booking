const { Organizer, Admin, User } = require('../models/User');
const crypto = require('crypto');

// @desc    Get all organizers
// @route   GET /api/admin/organizers
// @access  Private (Admin only)
exports.getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find().select('-password').sort('-createdAt');
    
    res.json({
      success: true,
      count: organizers.length,
      organizers
    });
  } catch (error) {
    console.error('Get organizers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizers',
      error: error.message
    });
  }
};

// @desc    Create new organizer account
// @route   POST /api/admin/organizers
// @access  Private (Admin only)
exports.createOrganizer = async (req, res) => {
  try {
    const {
      email,
      organizerName,
      category,
      description,
      contactEmail,
      contactNumber
    } = req.body;

    // Validate required fields
    if (!email || !organizerName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, organizer name, and category'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate random password
    const generatedPassword = crypto.randomBytes(8).toString('hex');

    // Create organizer
    const organizer = await Organizer.create({
      email,
      password: generatedPassword,
      role: 'organizer',
      organizerName,
      category,
      description,
      contactEmail: contactEmail || email,
      contactNumber,
      isApproved: true
    });

    // Return response (include password for admin to share)
    const organizerData = organizer.toObject();
    delete organizerData.password;

    res.status(201).json({
      success: true,
      message: 'Organizer account created successfully',
      organizer: organizerData,
      credentials: {
        email,
        password: generatedPassword
      }
    });

  } catch (error) {
    console.error('Create organizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organizer',
      error: error.message
    });
  }
};

// @desc    Remove/disable organizer account
// @route   DELETE /api/admin/organizers/:id
// @access  Private (Admin only)
exports.removeOrganizer = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    const { action } = req.query; // 'disable', 'delete', or 'archive'

    if (action === 'delete') {
      // Permanently delete
      await organizer.deleteOne();
      return res.json({
        success: true,
        message: 'Organizer permanently deleted'
      });
    } else {
      // Disable (soft delete)
      organizer.isActive = false;
      await organizer.save();
      return res.json({
        success: true,
        message: 'Organizer account disabled'
      });
    }

  } catch (error) {
    console.error('Remove organizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove organizer',
      error: error.message
    });
  }
};

// @desc    Restore disabled organizer
// @route   PUT /api/admin/organizers/:id/restore
// @access  Private (Admin only)
exports.restoreOrganizer = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    organizer.isActive = true;
    await organizer.save();

    res.json({
      success: true,
      message: 'Organizer account restored',
      organizer
    });

  } catch (error) {
    console.error('Restore organizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore organizer',
      error: error.message
    });
  }
};

// @desc    Reset organizer password
// @route   POST /api/admin/organizers/:id/reset-password
// @access  Private (Admin only)
exports.resetOrganizerPassword = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    // Generate new random password
    const newPassword = crypto.randomBytes(8).toString('hex');
    
    organizer.password = newPassword;
    await organizer.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      credentials: {
        email: organizer.email,
        password: newPassword
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const Event = require('../models/Event');
    const Registration = require('../models/Registration');

    const [
      totalOrganizers,
      activeOrganizers,
      totalParticipants,
      totalEvents,
      totalRegistrations
    ] = await Promise.all([
      Organizer.countDocuments(),
      Organizer.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'participant' }),
      Event.countDocuments(),
      Registration.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        totalOrganizers,
        activeOrganizers,
        inactiveOrganizers: totalOrganizers - activeOrganizers,
        totalParticipants,
        totalEvents,
        totalRegistrations
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// @desc    Get all password reset requests
// @route   GET /api/admin/password-reset-requests
// @access  Private (Admin only)
exports.getPasswordResetRequests = async (req, res) => {
  try {
    const PasswordResetRequest = require('../models/PasswordResetRequest');
    
    const { status } = req.query;
    
    const filter = {};
    if (status && ['pending', 'completed', 'closed'].includes(status)) {
      filter.status = status;
    }
    
    const requests = await PasswordResetRequest.find(filter)
      .populate('organizer', 'email organizerName category')
      .populate('completedBy', 'adminName email')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: requests.length,
      requests
    });
    
  } catch (error) {
    console.error('Get password reset requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch password reset requests',
      error: error.message
    });
  }
};

// @desc    Reset password and complete request
// @route   POST /api/admin/password-reset-requests/:id/reset
// @access  Private (Admin only)
exports.completePasswordResetRequest = async (req, res) => {
  try {
    const PasswordResetRequest = require('../models/PasswordResetRequest');
    
    const request = await PasswordResetRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Password reset request not found'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }
    
    // Find the organizer and reset their password
    const organizer = await Organizer.findById(request.organizer);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }
    
    // Generate new random password
    const newPassword = crypto.randomBytes(8).toString('hex');
    
    organizer.password = newPassword;
    await organizer.save();
    
    // Mark request as completed
    request.status = 'completed';
    request.completedAt = new Date();
    request.completedBy = req.user._id;
    await request.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      credentials: {
        email: organizer.email,
        password: newPassword
      }
    });
    
  } catch (error) {
    console.error('Complete password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete password reset request',
      error: error.message
    });
  }
};

// @desc    Close password reset request (without resetting)
// @route   POST /api/admin/password-reset-requests/:id/close
// @access  Private (Admin only)
exports.closePasswordResetRequest = async (req, res) => {
  try {
    const PasswordResetRequest = require('../models/PasswordResetRequest');
    
    const request = await PasswordResetRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Password reset request not found'
      });
    }
    
    // Mark request as closed
    request.status = 'closed';
    request.completedAt = new Date();
    request.completedBy = req.user._id;
    await request.save();
    
    res.json({
      success: true,
      message: 'Password reset request closed'
    });
    
  } catch (error) {
    console.error('Close password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close password reset request',
      error: error.message
    });
  }
};
