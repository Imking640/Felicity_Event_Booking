import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const OngoingEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOngoingEvents = async () => {
      setLoading(true);
      try {
        // Fetch all events for this organizer first
        const res = await api.get('/events', { 
          params: { 
            organizer: user?._id || user?.id
          } 
        });
        if (res.data.success) {
          // Filter for ongoing events (status === 'ongoing' OR published events where current date is between start and end)
          const now = new Date();
          const ongoingEvents = (res.data.events || []).filter(e => {
            // Check explicit ongoing status
            if (e.status === 'ongoing') return true;
            
            // Check if published event is currently running (between start and end date)
            if (e.status === 'published') {
              const startDate = new Date(e.eventStartDate || e.startDate);
              const endDate = new Date(e.eventEndDate || e.endDate);
              return now >= startDate && now <= endDate;
            }
            
            return false;
          });
          setEvents(ongoingEvents);
        }
      } catch (err) {
        console.error('Fetch ongoing events error', err);
        showDiscoToast('Failed to load ongoing events', false);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOngoingEvents();
  }, [user]);

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: "'Bungee', cursive", color: '#00ff00', fontSize: '2rem', marginBottom: '0.5rem' }}>
                🎪 Ongoing Events
              </h1>
              <p style={{ color: '#00ffff' }}>Manage your currently running events</p>
            </div>
            <button className="disco-button" onClick={() => navigate('/dashboard')}>
              📊 Back to Dashboard
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="disco-card" style={{ padding: '2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading ongoing events...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎪</div>
              <h3 style={{ color: '#ffff00', marginBottom: '0.5rem' }}>No Ongoing Events</h3>
              <p>You don't have any events currently running.</p>
              <button 
                className="disco-button" 
                onClick={() => navigate('/dashboard')}
                style={{ marginTop: '1rem' }}
              >
                View All Events
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {events.map(event => (
                <div 
                  key={event._id} 
                  className="event-card-disco"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/organizer/event/${event._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, color: '#ffff00', fontSize: '1.3rem' }}>{event.name}</h3>
                        <span style={{
                          background: '#00ff00',
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          🎪 ONGOING
                        </span>
                      </div>
                      
                      <div style={{ color: '#00ffff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        📅 {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </div>
                      
                      <div style={{ color: '#ddd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        📍 {event.venue}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ 
                          background: 'rgba(0,255,255,0.1)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px',
                          border: '1px solid rgba(0,255,255,0.3)'
                        }}>
                          <span style={{ color: '#00ffff' }}>👥 {event.currentRegistrations || 0}/{event.maxParticipants}</span>
                        </div>
                        <div style={{ 
                          background: 'rgba(255,0,255,0.1)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255,0,255,0.3)'
                        }}>
                          <span style={{ color: '#ff00ff' }}>💰 ₹{(event.currentRegistrations || 0) * (event.registrationFee || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        className="disco-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/organizer/event/${event._id}`);
                        }}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        👁️ View Details
                      </button>
                      <button 
                        className="disco-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event._id}/participants`);
                        }}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        📋 Participants
                      </button>
                      <button 
                        className="disco-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event._id}/attendance`);
                        }}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      >
                        📱 Scan Attendance
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OngoingEvents;
