import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const OrganizerEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', { params: { organizer: user?._id || user?.id } });
      if (res.data.success) {
        setEvents(res.data.events || res.data.events);
      }
    } catch (err) {
      console.error('Fetch organizer events error', err);
      showDiscoToast('Failed to load your events', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
    // eslint-disable-next-line
  }, [user]);

  const handlePublish = async (id) => {
    try {
      const res = await api.post(`/events/${id}/publish`);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Event published!', true);
        fetchEvents();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Publish failed', false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) {
        showDiscoToast('Event deleted', true);
        setEvents(prev => prev.filter(ev => ev._id !== id));
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Delete failed', false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>📋 My Events</h2>
          <div>
            <Link to="/create-event" className="disco-button">➕ Create New</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your events...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '2rem' }}>
            <p>No events yet. Create your first event.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {events.map(ev => (
              <div key={ev._id} className="event-card-disco" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{ev.eventName}</h3>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{ev.eventType} • {ev.eventStartDate ? new Date(ev.eventStartDate).toLocaleDateString() : 'TBA'}</div>
                  <div style={{ color: '#ddd', marginTop: '0.25rem' }}>{ev.eventDescription?.substring(0, 120)}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Status: <strong>{ev.status}</strong> • Registrations: {ev.currentRegistrations || 0}/{ev.registrationLimit || '∞'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="disco-button" onClick={() => navigate(`/events/${ev._id}`)}>View</button>
                  <button className="disco-button" onClick={() => navigate(`/events/${ev._id}/participants`)}>Participants</button>
                  {ev.status === 'draft' && (
                    <button className="disco-button" onClick={() => handlePublish(ev._id)}>Publish</button>
                  )}
                  <button className="disco-button" onClick={() => handleDelete(ev._id)} style={{ background: 'linear-gradient(90deg,#ff006e,#ff8fab)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerEvents;
