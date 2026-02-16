const express = require('express');
const router = express.Router();
const { optionalAuth, verifyToken, isParticipant } = require('../middleware/auth');
const { Organizer } = require('../models/User');
const Event = require('../models/Event');

// List organizers (approved & active) with details
router.get('/', optionalAuth, async (req, res) => {
  try {
    const organizers = await Organizer.find({ isApproved: true, isActive: true })
      .select('organizerName category description contactEmail');
    res.json({ success: true, count: organizers.length, organizers });
  } catch (error) {
    console.error('List organizers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch organizers', error: error.message });
  }
});

// Organizer detail
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id)
      .select('organizerName category description contactEmail contactNumber');
    if (!organizer) {
      return res.status(404).json({ success: false, message: 'Organizer not found' });
    }
    res.json({ success: true, organizer });
  } catch (error) {
    console.error('Get organizer error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch organizer', error: error.message });
  }
});

// Organizer events: upcoming or past
router.get('/:id/events', optionalAuth, async (req, res) => {
  try {
    const { scope = 'upcoming' } = req.query;
    const now = new Date();
    const match = { organizer: req.params.id, status: 'published' };
    if (scope === 'upcoming') {
      match.eventStartDate = { $gte: now };
    } else if (scope === 'past') {
      match.eventEndDate = { $lt: now };
    }
    const events = await Event.find(match)
      .sort('eventStartDate')
      .select('eventName eventType eventStartDate eventEndDate location eventImage status');
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch organizer events', error: error.message });
  }
});

// Follow / Unfollow an organizer
router.post('/:id/follow', verifyToken, isParticipant, async (req, res) => {
  try {
    const { Participant } = require('../models/User');
    const me = await Participant.findById(req.user.id);
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });
    const oid = req.params.id;
    if (!me.followedClubs.map(String).includes(String(oid))) {
      me.followedClubs.push(oid);
      await me.save();
    }
    res.json({ success: true, message: 'Followed organizer', followedClubs: me.followedClubs });
  } catch (error) {
    console.error('Follow organizer error:', error);
    res.status(500).json({ success: false, message: 'Failed to follow organizer', error: error.message });
  }
});

router.delete('/:id/follow', verifyToken, isParticipant, async (req, res) => {
  try {
    const { Participant } = require('../models/User');
    const me = await Participant.findById(req.user.id);
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });
    const oid = req.params.id;
    me.followedClubs = me.followedClubs.filter(id => String(id) !== String(oid));
    await me.save();
    res.json({ success: true, message: 'Unfollowed organizer', followedClubs: me.followedClubs });
  } catch (error) {
    console.error('Unfollow organizer error:', error);
    res.status(500).json({ success: false, message: 'Failed to unfollow organizer', error: error.message });
  }
});

module.exports = router;