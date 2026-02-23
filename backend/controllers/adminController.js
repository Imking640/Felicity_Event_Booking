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
      organizerName,
      category,
      description,
      contactEmail,
      contactNumber
    } = req.body;

    // Validate required fields
    if (!organizerName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organizer name and category'
      });
    }

    // Auto-generate email from organizer name
    const slug = organizerName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const email = `${slug}.${randomSuffix}@felicity.iiith.ac.in`;

    // Check if email already exists (extremely unlikely with random suffix, but just in case)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Generated email collision, please try again'
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
      // Permanently delete - cascade delete middleware in User model will handle all related data
      const Event = require('../models/Event');
      
      // Count events before deletion for response
      const eventCount = await Event.countDocuments({ organizer: req.params.id });
      const organizerName = organizer.organizerName;
      
      console.log(`🗑️ Admin deleting organizer: ${organizerName} with ${eventCount} event(s)`);
      
      // Delete the organizer - cascade middleware will handle everything
      await organizer.deleteOne();
      
      console.log(`✅ Admin completed deletion of organizer: ${organizerName}`);
      
      return res.json({
        success: true,
        message: 'Organizer and all associated events, registrations, and tickets permanently deleted',
        deletedEvents: eventCount
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
    
    const { adminComment } = req.body || {};
    
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
    
    request.status = 'completed';
    request.completedAt = new Date();
    request.completedBy = req.user._id;
    request.adminComment = adminComment || '';
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
    
    const { adminComment } = req.body || {};
    
    request.status = 'closed';
    request.completedAt = new Date();
    request.completedBy = req.user._id;
    request.adminComment = adminComment || '';
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

exports.getOrganizerResetHistory = async (req, res) => {
  try {
    const PasswordResetRequest = require('../models/PasswordResetRequest');
    
    const requests = await PasswordResetRequest.find({ organizer: req.params.id })
      .populate('completedBy', 'adminName email')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get organizer reset history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reset history',
      error: error.message
    });
  }
};
