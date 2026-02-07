const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth');
const {
  getDiscussion,
  postMessage,
  editMessage,
  deleteMessage,
  togglePinMessage,
  reactToMessage,
  toggleDiscussion,
  updateSettings
} = require('../controllers/discussionController');

// Get discussion forum for an event (public, but auth helps for features)
router.get('/:eventId', optionalAuth, getDiscussion);

// Post a new message (requires auth)
router.post('/:eventId/messages', verifyToken, postMessage);

// Edit a message (requires auth - author only)
router.put('/:eventId/messages/:messageId', verifyToken, editMessage);

// Delete a message (requires auth - author or organizer)
router.delete('/:eventId/messages/:messageId', verifyToken, deleteMessage);

// Pin/Unpin a message (organizer only)
router.post('/:eventId/messages/:messageId/pin', verifyToken, togglePinMessage);

// React to a message
router.post('/:eventId/messages/:messageId/react', verifyToken, reactToMessage);

// Toggle discussion forum (organizer only)
router.post('/:eventId/toggle', verifyToken, toggleDiscussion);

// Update discussion settings (organizer only)
router.put('/:eventId/settings', verifyToken, updateSettings);

module.exports = router;
