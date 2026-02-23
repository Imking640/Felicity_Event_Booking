import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { showDiscoToast } from '../components/DiscoDecorations';

/**
 * Global Discussion Notification Service
 * Polls for new messages across all events the user is registered for
 * Shows notifications globally regardless of current page
 */
export const useGlobalDiscussionNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const lastMessageCountsRef = useRef({});
  const isInitializedRef = useRef({});
  const pollingIntervalRef = useRef(null);

  const fetchRegisteredEvents = useCallback(async () => {
    if (!isAuthenticated || !user) return [];

    try {
      // For participants: get their registrations
      if (user.role === 'participant') {
        const res = await api.get('/registrations/my-registrations');
        if (res.data.success) {
          return res.data.registrations
            .filter(reg => reg.status === 'confirmed' || reg.status === 'pending')
            .map(reg => reg.event?._id || reg.event)
            .filter(Boolean);
        }
      }
      
      // For organizers: get their events
      if (user.role === 'organizer') {
        const res = await api.get('/events', { params: { organizer: user._id } });
        if (res.data.success) {
          return res.data.events.map(e => e._id).filter(Boolean);
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching registered events:', error);
      return [];
    }
  }, [isAuthenticated, user]);

  const checkForNewMessages = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Get all events user is registered for or organizing
      const eventIds = await fetchRegisteredEvents();
      
      if (eventIds.length === 0) return;

      // Check each event's discussion for new messages
      for (const eventId of eventIds) {
        try {
          const res = await api.get(`/discussions/${eventId}`);
          
          if (res.data.success) {
            const messages = res.data.messages || [];
            const currentCount = messages.length;
            const previousCount = lastMessageCountsRef.current[eventId] || 0;
            const isInitialized = isInitializedRef.current[eventId] || false;

            // Only show notifications if:
            // 1. This event has been initialized (not first load)
            // 2. Message count increased
            // 3. There are new messages
            if (isInitialized && currentCount > previousCount && messages.length > 0) {
              const newCount = currentCount - previousCount;
              
              // Get the last N new messages
              const newMessages = messages.slice(-newCount);
              
              // Show notification for each new message (with limit to avoid spam)
              const maxNotifications = 3; // Show max 3 notifications at once
              const messagesToShow = newMessages.slice(-maxNotifications);
              
              messagesToShow.forEach((msg, index) => {
                setTimeout(() => {
                  // Don't show notifications for messages from current user
                  if (msg.author?._id === user._id) return;
                  
                  const authorName = msg.author?.organizerName || 
                                   `${msg.author?.firstName || ''} ${msg.author?.lastName || ''}`.trim() || 
                                   'Someone';
                  
                  const eventName = res.data.discussion?.event?.eventName || 'an event';
                  
                  const messagePreview = msg.content.length > 40 
                    ? msg.content.substring(0, 40) + '...' 
                    : msg.content;
                  
                  let icon = '💬';
                  if (msg.messageType === 'announcement') icon = '📢';
                  if (msg.messageType === 'question') icon = '❓';
                  
                  showDiscoToast(
                    `${icon} ${authorName} in "${eventName}": ${messagePreview}`, 
                    true
                  );
                }, index * 400); // Stagger notifications
              });
              
              // If there were more than max, show a summary
              if (newCount > maxNotifications) {
                setTimeout(() => {
                  showDiscoToast(
                    `📬 ${newCount - maxNotifications} more message(s) in discussions`,
                    true
                  );
                }, maxNotifications * 400);
              }
            }

            // Update tracking
            lastMessageCountsRef.current[eventId] = currentCount;
            isInitializedRef.current[eventId] = true;
          }
        } catch (error) {
          // Silently fail for individual events (might not have discussion enabled)
          console.debug(`Discussion check failed for event ${eventId}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  }, [isAuthenticated, user, fetchRegisteredEvents]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clear interval if user logs out
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      lastMessageCountsRef.current = {};
      isInitializedRef.current = {};
      return;
    }

    // Initial check (silent, just initialize counts)
    checkForNewMessages();

    // Set up polling every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkForNewMessages();
    }, 15000); // Check every 15 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, checkForNewMessages]);

  return null; // This is a service hook, doesn't render anything
};
