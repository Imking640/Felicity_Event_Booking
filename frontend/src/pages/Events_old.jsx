import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [registering, setRegistering] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load events');
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistering(eventId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post(`/events/${eventId}/register`);
      
      if (response.data.success) {
        setSuccessMessage('🎉 Successfully registered for the event!');
        
        // Update the event's current registrations
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event._id === eventId
              ? { ...event, currentRegistrations: (event.currentRegistrations || 0) + 1 }
              : event
          )
        );

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to register for event';
      setError(errorMsg);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setRegistering(null);
    }
  };

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop'];
  
  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(event => event.eventType === selectedCategory);

  const getEventEmoji = (type) => {
    const emojis = {
      'Technical': '💻',
      'Cultural': '🎭',
      'Sports': '⚽',
      'Workshop': '🛠️',
      'Competition': '🏆'
    };
    return emojis[type] || '🎪';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)' 
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '3rem' }}
        >
          🎪
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem', 
        color: 'white',
        fontSize: '1.2rem'
      }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.95) 0%, rgba(57, 255, 20, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '15px',
            boxShadow: '0 10px 40px rgba(40, 167, 69, 0.5)',
            zIndex: 1000,
            fontWeight: '600',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            minWidth: '300px'
          }}
        >
          {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 59, 48, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '15px',
            boxShadow: '0 10px 40px rgba(255, 59, 48, 0.5)',
            zIndex: 1000,
            fontWeight: '600',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            minWidth: '300px'
          }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '3rem' }}
      >
        <motion.h1
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            fontSize: '3.5rem',
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(245,87,108,0.3)'
          }}
        >
          🎪 Explore Events
        </motion.h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.2rem',
          fontWeight: '500'
        }}>
          Discover amazing events happening at Felicity 2026!
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedCategory === category
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: selectedCategory === category
                ? '2px solid rgba(245,87,108,0.8)'
                : '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: selectedCategory === category
                ? '0 5px 20px rgba(245,87,108,0.4)'
                : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>
      
      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            No events found
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Check back later for exciting events!
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '2rem' 
          }}
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '25px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Event Header */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(240,147,251,0.3) 0%, rgba(245,87,108,0.3) 100%)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '2.5rem',
                    opacity: 0.6
                  }}
                >
                  {getEventEmoji(event.eventType)}
                </motion.div>
                
                <h3 style={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem'
                }}>
                  {event.eventName}
                </h3>
                
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(5px)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {event.eventType}
                </div>
              </div>
              
              {/* Event Details */}
              <div style={{ padding: '1.5rem' }}>
                <p style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  marginBottom: '1.5rem', 
                  lineHeight: '1.6',
                  minHeight: '60px'
                }}>
                  {event.eventDescription?.substring(0, 100)}...
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem', 
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.75rem',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📅</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Date</div>
                    <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>
                      {new Date(event.eventStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.75rem',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👥</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>Spots</div>
                    <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>
                      {event.currentRegistrations || 0} / {event.registrationLimit || '∞'}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.75rem',
                  borderRadius: '15px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>🎓</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    <strong>Eligibility:</strong> {event.eligibility}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRegister(event._id)}
                  style={{
                    width: '100%',
                    background: event.isFull || registering === event._id
                      ? 'rgba(150, 150, 150, 0.5)'
                      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: (event.isFull || registering === event._id) ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '1rem',
                    boxShadow: (event.isFull || registering === event._id) ? 'none' : '0 5px 20px rgba(245,87,108,0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={event.isFull || registering === event._id}
                >
                  {registering === event._id 
                    ? '⏳ Registering...' 
                    : event.isFull 
                    ? '😔 Event Full' 
                    : '🎉 Register Now'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Events;
