import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [scopeFollowed, setScopeFollowed] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, search, scopeFollowed]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('type', selectedCategory);
      if (search.trim()) params.append('search', search.trim());
      if (scopeFollowed) params.append('scope', 'followed');
      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (err) {
      showDiscoToast('⚠️ Failed to load events', false);
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await api.get('/events/trending/list?limit=5');
      setTrending(res.data.events || []);
    } catch {}
  };

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      showDiscoToast('⚠️ Please login to register for events', false);
      navigate('/login');
      return;
    }

    if (user?.role !== 'participant') {
      showDiscoToast('⚠️ Only participants can register for events. Please login with a participant account.', false);
      return;
    }

    // Navigate to registration page
    navigate(`/events/${eventId}/register`);
  };

  const categories = ['All', 'Normal', 'Merchandise'];
  
  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(event => event.eventType === selectedCategory);

  const getEventEmoji = (type) => {
    const emojis = {
      'Normal': '�',
      'Merchandise': '�️'
    };
    return emojis[type] || '🎪';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        position: 'relative'
      }}>
        <DiscoDecorations />
        <div style={{ 
          fontSize: '4rem',
          animation: 'spin-vinyl 2s linear infinite',
          zIndex: 10
        }}>
          💿
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)', 
      padding: '2rem',
      position: 'relative'
    }}>
      <DiscoDecorations />

      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontFamily: "'Bungee', cursive",
          color: '#ffff00',
          textShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)',
          letterSpacing: '3px',
          marginBottom: '1rem'
        }}>
          🎭 DISCOVER EVENTS 🎭
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#00ffff',
          fontFamily: "'Anton', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
        }}>
          Find Your Perfect Experience
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 10
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events or organizers..."
          className="disco-input"
          style={{ minWidth: 280 }}
        />
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "disco-button" : ""}
            style={{
              padding: '0.8rem 1.5rem',
              background: selectedCategory === category 
                ? undefined
                : 'rgba(255, 255, 255, 0.1)',
              border: selectedCategory === category
                ? undefined
                : '2px solid rgba(0, 255, 255, 0.4)',
              borderRadius: '15px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Bungee', cursive",
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.border = '2px solid rgba(0, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.border = '2px solid rgba(0, 255, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {category}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <input type="checkbox" checked={scopeFollowed} onChange={e => setScopeFollowed(e.target.checked)} />
          Followed Clubs Only
        </label>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="disco-card" style={{ padding: '1rem', margin: '0 auto 1.5rem', maxWidth: 1000 }}>
          <h3 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '0.5rem' }}>🔥 Trending (24h)</h3>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {trending.map(ev => (
              <div key={ev._id} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem 0.8rem', borderRadius: 10, color: '#fff' }}>
                {ev.eventName} <span style={{ color: '#00ffff' }}>({ev.trendingCount24h})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '4rem',
            color: '#fff',
            fontSize: '1.5rem',
            fontFamily: "'Anton', sans-serif"
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😢</div>
            No events found in this category
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id} className="event-card-disco">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {getEventEmoji(event.eventType)}
              </div>
              
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '0.5rem',
                color: '#ff00ff',
                fontFamily: "'Bungee', cursive",
                textShadow: '0 0 10px rgba(255, 0, 255, 0.6)',
                wordBreak: 'break-word'
              }}>
                {event.eventName}
              </h3>

              <p style={{
                fontSize: '0.9rem',
                color: '#00ffff',
                marginBottom: '1rem',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {event.eventType} • {event.organizer?.organizerName || 'Organizer'}
              </p>

              <p style={{
                color: '#fff',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                fontFamily: "'Anton', sans-serif",
                fontSize: '0.95rem'
              }}>
                {event.eventDescription?.substring(0, 120)}
                {event.eventDescription?.length > 120 ? '...' : ''}
              </p>

              <div style={{ 
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 0, 0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 0, 0.5)',
                  fontFamily: "'Anton', sans-serif",
                  fontSize: '0.9rem',
                  flex: '1 1 auto'
                }}>
                  📅 {new Date(event.eventStartDate).toLocaleDateString()}
                </div>
                {event.venue && (
                  <div style={{
                    background: 'rgba(0, 255, 255, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 255, 255, 0.5)',
                    fontFamily: "'Anton', sans-serif",
                    fontSize: '0.9rem',
                    flex: '1 1 auto'
                  }}>
                    📍 {event.venue}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                padding: '0.8rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{
                  color: '#fff',
                  fontFamily: "'Anton', sans-serif",
                  fontSize: '0.9rem'
                }}>
                  👥 {event.currentRegistrations || 0} / {event.registrationLimit || event.maxParticipants || '∞'}
                </span>
                <span style={{
                  color: '#ffff00',
                  fontWeight: '700',
                  fontFamily: "'Bungee', cursive",
                  fontSize: '1.1rem',
                  textShadow: '0 0 10px rgba(255, 255, 0, 0.6)'
                }}>
                  ₹{event.registrationFee || 0}
                </span>
              </div>

              <button
                onClick={() => handleRegister(event._id)}
                disabled={
                  (user && user.role !== 'participant') ||
                  event.currentRegistrations >= (event.registrationLimit || event.maxParticipants) ||
                  !event.isRegistrationOpen
                }
                className="disco-button"
                style={{ 
                  width: '100%',
                  opacity: ((user && user.role !== 'participant') || event.currentRegistrations >= (event.registrationLimit || event.maxParticipants) || !event.isRegistrationOpen) ? 0.5 : 1,
                  cursor: ((user && user.role !== 'participant') || event.currentRegistrations >= (event.registrationLimit || event.maxParticipants) || !event.isRegistrationOpen) ? 'not-allowed' : 'pointer'
                }}
              >
                {(user && user.role !== 'participant')
                  ? '🔒 PARTICIPANTS ONLY'
                  : !event.isRegistrationOpen
                  ? '🔒 REGISTRATION CLOSED'
                  : event.currentRegistrations >= (event.registrationLimit || event.maxParticipants)
                  ? '❌ HOUSE FULL'
                  : '🎟️ REGISTER NOW'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
