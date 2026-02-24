const axios = require('axios');

/**
 * Send an event announcement to Discord via webhook
 * @param {Object} event - The event object to announce
 * @param {string} type - 'created' or 'published'
 */
const postToDiscord = async (event, type = 'published') => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('⚠️ DISCORD_WEBHOOK_URL not configured, skipping Discord post');
      return { success: false, message: 'Discord webhook not configured' };
    }

    // Format date nicely
    const formatDate = (dateStr) => {
      if (!dateStr) return 'TBD';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Get organizer name
    const organizerName = event.organizer?.organizerName || 'Felicity';

    // Choose color based on event type
    const colorMap = {
      'Normal': 0x00FF00, // Green
      'Merchandise': 0xFF6B00 // Orange
    };
    const embedColor = colorMap[event.eventType] || 0x7B68EE; // Default purple

    // Create Discord embed message
    const embed = {
      title: `🎉 ${event.eventName}`,
      description: event.eventDescription?.substring(0, 500) + (event.eventDescription?.length > 500 ? '...' : '') || 'Check out this exciting event!',
      color: embedColor,
      fields: [
        {
          name: '🏛️ Organizer',
          value: organizerName,
          inline: true
        },
        {
          name: '📅 Event Date',
          value: formatDate(event.eventStartDate),
          inline: true
        },
        {
          name: '📍 Venue',
          value: event.venue || 'TBD',
          inline: true
        },
        {
          name: '🎫 Registration Fee',
          value: event.registrationFee > 0 ? `₹${event.registrationFee}` : 'FREE',
          inline: true
        },
        {
          name: '👥 Spots Available',
          value: event.registrationLimit ? `${event.registrationLimit - (event.currentRegistrations || 0)} / ${event.registrationLimit}` : 'Unlimited',
          inline: true
        },
        {
          name: '🎓 Eligibility',
          value: event.eligibility || 'All',
          inline: true
        }
      ],
      footer: {
        text: `${event.eventType} Event • Registration closes ${formatDate(event.registrationDeadline)}`
      },
      timestamp: new Date().toISOString()
    };

    // Add tags if present
    if (event.tags && event.tags.length > 0) {
      embed.fields.push({
        name: '🏷️ Tags',
        value: event.tags.map(t => `\`${t}\``).join(' '),
        inline: false
      });
    }

    // Add event image if available
    if (event.eventImage) {
      embed.thumbnail = {
        url: event.eventImage
      };
    }

    // Registration link
    const siteUrl = process.env.FRONTEND_URL || 'https://felicity-event-booking.vercel.app';
    const eventUrl = `${siteUrl}/events/${event._id}/register`;

    // Compose message content
    const content = type === 'published' 
      ? `📢 **New Event Alert!** ${organizerName} just published an exciting event! 🚀`
      : `✨ **Coming Soon!** ${organizerName} is preparing something amazing! Stay tuned!`;

    // Discord webhook payload
    const payload = {
      content: content,
      embeds: [embed],
      components: [
        {
          type: 1, // Action row
          components: [
            {
              type: 2, // Button
              style: 5, // Link style
              label: '🎟️ Register Now',
              url: eventUrl
            },
            {
              type: 2,
              style: 5,
              label: '📋 View All Events',
              url: `${siteUrl}/events`
            }
          ]
        }
      ]
    };

    // Send to Discord
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Discord notification sent successfully for event:', event.eventName);
    return { success: true, message: 'Posted to Discord successfully' };

  } catch (error) {
    console.error('❌ Discord webhook error:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Post a custom message to Discord
 * @param {string} message - The message to post
 */
const postMessageToDiscord = async (message) => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('⚠️ DISCORD_WEBHOOK_URL not configured');
      return { success: false, message: 'Discord webhook not configured' };
    }

    await axios.post(webhookUrl, {
      content: message
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Discord message error:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Post a discussion announcement to Discord
 * @param {Object} announcement - The announcement message object
 * @param {Object} event - The event object
 * @param {Object} organizer - The organizer object
 */
const postAnnouncementToDiscord = async (announcement, event, organizer) => {
  try {
    // Use organizer's webhook if available, otherwise use global webhook
    const webhookUrl = organizer.discordWebhook || process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('⚠️ No Discord webhook configured, skipping announcement post');
      return { success: false, message: 'Discord webhook not configured' };
    }

    // Format timestamp
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const siteUrl = process.env.FRONTEND_URL || 'https://felicity-event-booking.vercel.app';
    const eventUrl = `${siteUrl}/events/${event._id}`;

    // Create Discord embed for announcement
    const embed = {
      title: `📢 Announcement: ${event.eventName}`,
      description: announcement.content,
      color: 0xFFD700, // Gold color for announcements
      author: {
        name: organizer.organizerName || organizer.name,
        icon_url: organizer.logo || undefined
      },
      fields: [
        {
          name: '🎪 Event',
          value: event.eventName,
          inline: true
        },
        {
          name: '📅 Date',
          value: formatDate(event.eventStartDate),
          inline: true
        }
      ],
      footer: {
        text: `Posted by ${organizer.organizerName || organizer.name}`,
        icon_url: organizer.logo || undefined
      },
      timestamp: announcement.createdAt || new Date().toISOString()
    };

    // Discord webhook payload
    const payload = {
      content: `🔔 **New Announcement from ${organizer.organizerName || organizer.name}!**`,
      embeds: [embed],
      components: [
        {
          type: 1, // Action row
          components: [
            {
              type: 2, // Button
              style: 5, // Link style
              label: '📖 View Event Discussion',
              url: eventUrl
            }
          ]
        }
      ]
    };

    // Send to Discord
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Discord announcement sent successfully for event:', event.eventName);
    return { success: true, message: 'Announcement posted to Discord successfully' };

  } catch (error) {
    console.error('❌ Discord announcement error:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  postToDiscord,
  postMessageToDiscord,
  postAnnouncementToDiscord
};
