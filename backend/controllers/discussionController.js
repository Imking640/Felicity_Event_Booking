const Discussion = require('../models/Discussion');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get discussion forum for an event
// @route   GET /api/discussions/:eventId
// @access  Public (but some features require auth)
exports.getDiscussion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find or create discussion for this event
    let discussion = await Discussion.findOne({ event: eventId })
      .populate({
        path: 'messages.author',
        select: 'firstName lastName email organizerName role'
      })
      .populate({
        path: 'messages.deletedBy',
        select: 'firstName lastName organizerName'
      });

    if (!discussion) {
      discussion = await Discussion.create({ event: eventId });
    }

    // Filter and sort messages
    const messages = discussion.messages
      .filter(m => !m.isDeleted)
      .sort((a, b) => {
        // Pinned messages first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by date (newest first for top-level, oldest first for display)
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    // Separate pinned and regular messages
    const pinnedMessages = messages.filter(m => m.isPinned);
    const regularMessages = messages.filter(m => !m.isPinned);

    // Paginate regular messages
    const startIndex = (page - 1) * limit;
    const paginatedMessages = regularMessages.slice(startIndex, startIndex + parseInt(limit));

    // Build threaded structure
    const threadedMessages = buildThreadedMessages([...pinnedMessages, ...paginatedMessages], messages);

    res.json({
      success: true,
      discussion: {
        _id: discussion._id,
        event: discussion.event,
        isEnabled: discussion.isEnabled,
        settings: discussion.settings,
        messageCount: messages.length
      },
      messages: threadedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: regularMessages.length,
        pages: Math.ceil(regularMessages.length / limit)
      }
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
};

// Helper function to build threaded messages
function buildThreadedMessages(messagesToShow, allMessages) {
  const messageMap = new Map();
  
  // Create a map of all messages
  allMessages.forEach(msg => {
    messageMap.set(msg._id.toString(), {
      ...msg.toObject(),
      replies: []
    });
  });

  // Build thread structure
  const rootMessages = [];
  
  messagesToShow.forEach(msg => {
    const msgObj = messageMap.get(msg._id.toString());
    if (!msgObj) return;
    
    if (!msg.parentMessage) {
      // Find replies for this message
      const replies = allMessages
        .filter(m => m.parentMessage && m.parentMessage.toString() === msg._id.toString() && !m.isDeleted)
        .map(m => messageMap.get(m._id.toString()))
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      msgObj.replies = replies;
      rootMessages.push(msgObj);
    }
  });

  return rootMessages;
}

// @desc    Post a new message
// @route   POST /api/discussions/:eventId/messages
// @access  Private (registered participants or organizer)
exports.postMessage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content, messageType = 'message', parentMessageId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find or create discussion
    let discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      discussion = await Discussion.create({ event: eventId });
    }

    if (!discussion.isEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Discussion forum is disabled for this event'
      });
    }

    // Check if user is organizer
    const isOrganizer = event.organizer.toString() === req.user.id;
    
    // Check if user is registered (for participants)
    if (!isOrganizer && req.user.role === 'participant') {
      if (discussion.settings.requireRegistration) {
        const registration = await Registration.findOne({
          event: eventId,
          participant: req.user.id,
          status: 'confirmed'
        });
        
        if (!registration) {
          return res.status(403).json({
            success: false,
            message: 'You must be registered for this event to post messages'
          });
        }
      }
    }

    // Only organizers can post announcements
    if (messageType === 'announcement' && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can post announcements'
      });
    }

    // Create new message
    const newMessage = {
      author: req.user.id,
      content: content.trim(),
      messageType,
      parentMessage: parentMessageId || null,
      reactions: [],
      isPinned: false,
      isDeleted: false
    };

    discussion.messages.push(newMessage);
    await discussion.save();

    // Get the saved message with populated author
    const savedMessage = discussion.messages[discussion.messages.length - 1];
    
    // Populate author info
    await Discussion.populate(discussion, {
      path: 'messages.author',
      select: 'firstName lastName email organizerName role'
    });

    const populatedMessage = discussion.messages.find(
      m => m._id.toString() === savedMessage._id.toString()
    );

    res.status(201).json({
      success: true,
      message: 'Message posted successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Post message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post message',
      error: error.message
    });
  }
};

// @desc    Edit a message
// @route   PUT /api/discussions/:eventId/messages/:messageId
// @access  Private (author only)
exports.editMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const message = discussion.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only author can edit their message
    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    message.content = content.trim();
    message.editedAt = Date.now();
    await discussion.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/discussions/:eventId/messages/:messageId
// @access  Private (author or organizer)
exports.deleteMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const message = discussion.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permission - author or organizer can delete
    const isOrganizer = event.organizer.toString() === req.user.id;
    const isAuthor = message.author.toString() === req.user.id;

    if (!isOrganizer && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedBy = req.user.id;
    message.deletedAt = Date.now();
    await discussion.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// @desc    Pin/Unpin a message
// @route   POST /api/discussions/:eventId/messages/:messageId/pin
// @access  Private (organizer only)
exports.togglePinMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only organizer can pin messages
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can pin messages'
      });
    }

    const discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const message = discussion.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.isPinned = !message.isPinned;
    await discussion.save();

    res.json({
      success: true,
      message: message.isPinned ? 'Message pinned' : 'Message unpinned',
      isPinned: message.isPinned
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin',
      error: error.message
    });
  }
};

// @desc    React to a message
// @route   POST /api/discussions/:eventId/messages/:messageId/react
// @access  Private
exports.reactToMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    const { reaction } = req.body;

    const validReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    const discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const message = discussion.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this reaction
    const existingReactionIndex = message.reactions.findIndex(
      r => r.user.toString() === req.user.id && r.type === reaction
    );

    if (existingReactionIndex > -1) {
      // Remove reaction (toggle off)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Remove any existing reaction from this user and add new one
      message.reactions = message.reactions.filter(
        r => r.user.toString() !== req.user.id
      );
      message.reactions.push({
        user: req.user.id,
        type: reaction
      });
    }

    await discussion.save();

    res.json({
      success: true,
      message: 'Reaction updated',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to react to message',
      error: error.message
    });
  }
};

// @desc    Toggle discussion forum enabled/disabled
// @route   POST /api/discussions/:eventId/toggle
// @access  Private (organizer only)
exports.toggleDiscussion = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can toggle the discussion forum'
      });
    }

    let discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      discussion = await Discussion.create({ event: eventId });
    }

    discussion.isEnabled = !discussion.isEnabled;
    await discussion.save();

    res.json({
      success: true,
      message: discussion.isEnabled ? 'Discussion forum enabled' : 'Discussion forum disabled',
      isEnabled: discussion.isEnabled
    });
  } catch (error) {
    console.error('Toggle discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle discussion',
      error: error.message
    });
  }
};

// @desc    Update discussion settings
// @route   PUT /api/discussions/:eventId/settings
// @access  Private (organizer only)
exports.updateSettings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { allowAnonymous, requireRegistration, moderationEnabled } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can update settings'
      });
    }

    let discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      discussion = await Discussion.create({ event: eventId });
    }

    if (typeof allowAnonymous === 'boolean') {
      discussion.settings.allowAnonymous = allowAnonymous;
    }
    if (typeof requireRegistration === 'boolean') {
      discussion.settings.requireRegistration = requireRegistration;
    }
    if (typeof moderationEnabled === 'boolean') {
      discussion.settings.moderationEnabled = moderationEnabled;
    }

    await discussion.save();

    res.json({
      success: true,
      message: 'Settings updated',
      settings: discussion.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};
