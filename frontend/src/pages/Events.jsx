import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading events...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#c33' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#667eea', marginBottom: '2rem' }}>Upcoming Events</h1>
      
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          No events available at the moment
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {events.map((event) => (
            <div 
              key={event._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <div style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '1rem',
                fontWeight: 'bold',
                fontSize: '1.125rem'
              }}>
                {event.eventName}
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#666', marginBottom: '1rem', minHeight: '60px' }}>
                  {event.eventDescription?.substring(0, 100)}...
                </p>
                
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <strong>Type:</strong> {event.eventType}
                </div>
                
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <strong>Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}
                </div>
                
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <strong>Eligibility:</strong> {event.eligibility}
                </div>
                
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
                  <strong>Registrations:</strong> {event.currentRegistrations} / {event.registrationLimit || '∞'}
                </div>
                
                <button
                  style={{
                    width: '100%',
                    backgroundColor: event.isFull ? '#ccc' : '#667eea',
                    color: 'white',
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: event.isFull ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                  disabled={event.isFull}
                >
                  {event.isFull ? 'Event Full' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
