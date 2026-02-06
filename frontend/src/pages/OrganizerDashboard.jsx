import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    totalAttendance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/events', { params: { organizer: user?._id || user?.id } });
        if (res.data.success) {
          const eventsData = res.data.events || [];
          setEvents(eventsData);
          
          // Calculate analytics
          const completed = eventsData.filter(e => e.status === 'completed');
          const totalRegs = eventsData.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0);
          const totalRev = eventsData.reduce((sum, e) => sum + ((e.currentRegistrations || 0) * (e.registrationFee || 0)), 0);
          
          setAnalytics({
            totalEvents: eventsData.length,
            totalRegistrations: totalRegs,
            totalRevenue: totalRev,
            totalAttendance: completed.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0)
          });
        }
      } catch (err) {
        console.error('Fetch dashboard error', err);
        showDiscoToast('Failed to load dashboard', false);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return '#888';
      case 'published': return '#00ffff';
      case 'ongoing': return '#00ff00';
      case 'completed': return '#ff00ff';
      case 'cancelled': return '#ff0000';
      default: return '#fff';
    }
  };

  const getStatusBadge = (status) => {
    const icons = {
      draft: '📝',
      published: '✅',
      ongoing: '🎪',
      completed: '🏆',
      cancelled: '❌'
    };
    return `${icons[status] || '📋'} ${status.toUpperCase()}`;
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Welcome Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Welcome, {user?.organizerName || 'Organizer'}! 🎉
          </h1>
          <p style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>
            {user?.category || 'Event Organizer'} • {user?.email}
          </p>
        </div>

        {/* Event Analytics */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', marginBottom: '1.5rem' }}>
            📊 Event Analytics
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,0,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#ffff00' }} className="glow-text">
                {analytics.totalEvents}
              </div>
              <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Events</div>
            </div>
            
            <div style={{ background: 'rgba(0,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,255,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#00ffff' }} className="glow-text">
                {analytics.totalRegistrations}
              </div>
              <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Registrations</div>
            </div>
            
            <div style={{ background: 'rgba(255,0,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,255,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#ff00ff' }} className="glow-text">
                ₹{analytics.totalRevenue}
              </div>
              <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Revenue</div>
            </div>
            
            <div style={{ background: 'rgba(0,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,0,0.3)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#00ff00' }} className="glow-text">
                {analytics.totalAttendance}
              </div>
              <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Attendance</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Bungee', cursive", color: '#00ffff', marginBottom: '1.5rem' }}>
            ⚡ Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <button 
              className="disco-button" 
              onClick={() => navigate('/create-event')}
              style={{ padding: '1.5rem', fontSize: '1.1rem' }}
            >
              ➕ Create New Event
            </button>
            <button 
              className="disco-button" 
              onClick={() => navigate('/organizer/payment-approvals')}
              style={{ padding: '1.5rem', fontSize: '1.1rem' }}
            >
              💳 Payment Approvals
            </button>
            <button 
              className="disco-button" 
              onClick={() => navigate('/organizer/profile')}
              style={{ padding: '1.5rem', fontSize: '1.1rem' }}
            >
              👤 Edit Profile
            </button>
          </div>
        </div>

        {/* Events Carousel */}
        <div className="disco-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>
              🎭 Your Events
            </h2>
            <button className="disco-button" onClick={() => navigate('/create-event')}>
              ➕ Create New Event
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎪</div>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No events created yet</p>
              <button className="disco-button" onClick={() => navigate('/create-event')}>
                Create Your First Event
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {events.map(ev => (
                <div 
                  key={ev._id} 
                  className="event-card-disco"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/organizer/event/${ev._id}`)}
                >
                  <div style={{ 
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    marginBottom: '0.75rem',
                    background: getStatusColor(ev.status),
                    color: '#000',
                    fontWeight: 'bold'
                  }}>
                    {getStatusBadge(ev.status)}
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#ffff00' }}>
                    {ev.eventName}
                  </h3>
                  
                  <div style={{ color: '#00ffff', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {ev.eventType} • {ev.eventStartDate ? new Date(ev.eventStartDate).toLocaleDateString() : 'TBA'}
                  </div>
                  
                  <div style={{ color: '#ddd', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {ev.eventDescription?.substring(0, 100)}...
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      <span style={{ color: '#00ff00' }}>👥 {ev.currentRegistrations || 0}</span>
                      <span style={{ color: '#888' }}> / {ev.registrationLimit || '∞'}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ff00ff' }}>
                      ₹{(ev.currentRegistrations || 0) * (ev.registrationFee || 0)}
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

export default OrganizerDashboard;
