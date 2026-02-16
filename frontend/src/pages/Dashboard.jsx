import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DiscoDecorations from '../components/DiscoDecorations';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('normal');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/registrations/summary');
        setSummary(res.data.summary || null);
      } catch (e) {
        console.error('Failed to load registrations:', e);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'participant') load();
    else setLoading(false);
  }, [user]);

  // Get upcoming events (registered events that haven't started yet)
  const getUpcomingEvents = () => {
    if (!summary) return [];
    const now = new Date();
    const allRegistrations = [
      ...summary.normal,
      ...summary.merchandise
    ];
    return allRegistrations.filter(r => {
      const eventDate = new Date(r.event?.eventStartDate);
      return eventDate > now && r.status === 'confirmed';
    });
  };

  // Get tab data
  const getTabData = () => {
    if (!summary) return [];
    switch (activeTab) {
      case 'normal':
        return summary.normal || [];
      case 'merchandise':
        return summary.merchandise || [];
      case 'completed':
        return summary.completed || [];
      case 'cancelled':
        return summary.cancelledRejected || [];
      default:
        return [];
    }
  };

  const tabs = [
    { key: 'normal', label: 'Normal', color: '#00ffff' },
    { key: 'merchandise', label: 'Merchandise', color: '#ff00ff' },
    { key: 'completed', label: 'Completed', color: '#00ff00' },
    { key: 'cancelled', label: 'Cancelled/Rejected', color: '#ff6666' }
  ];

  const getStatusBadge = (registration) => {
    const statusColors = {
      'confirmed': { bg: '#00ff00', text: '#000' },
      'pending': { bg: '#ffff00', text: '#000' },
      'cancelled': { bg: '#ff6666', text: '#fff' },
      'rejected': { bg: '#ff0000', text: '#fff' },
      'payment_pending': { bg: '#ff9900', text: '#000' }
    };
    const style = statusColors[registration.status] || statusColors['pending'];
    return (
      <span style={{
        background: style.bg,
        color: style.text,
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {registration.status?.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
        <DiscoDecorations />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      position: 'relative'
    }}>
      <DiscoDecorations />

      {/* Welcome Header */}
      <div className="disco-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontFamily: "'Bungee', cursive",
          marginBottom: '0.5rem',
          color: '#ffff00',
          textShadow: '0 0 20px rgba(255, 255, 0, 0.8)'
        }}>
          Welcome, {user?.firstName || 'Participant'}! 🎉
        </h1>
        <p style={{
          color: '#00ffff',
          fontSize: '1rem',
          fontFamily: "'Anton', sans-serif"
        }}>
          Ready to make Felicity 2026 unforgettable?
        </p>
      </div>

      {/* Upcoming Events Section */}
      <div className="disco-card" style={{
        padding: '1.5rem',
        marginBottom: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1.5rem',
          color: '#ff00ff',
          fontFamily: "'Bungee', cursive"
        }}>
          📅 Upcoming Events
        </h2>

        {getUpcomingEvents().length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {getUpcomingEvents().map((reg) => (
              <div key={reg._id} style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ color: '#ffff00', marginBottom: '0.3rem', fontFamily: "'Bungee', cursive" }}>
                    {reg.event?.eventName || 'Unknown Event'}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                    <span>🎭 {reg.event?.eventType || '-'}</span>
                    <span>👤 {reg.event?.organizer?.organizerName || '-'}</span>
                    <span>📅 {reg.event?.eventStartDate ? new Date(reg.event.eventStartDate).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                    }) : '-'}</span>
                    <span>🕐 {reg.event?.eventStartDate ? new Date(reg.event.eventStartDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit'
                    }) : '-'}</span>
                  </div>
                </div>
                <button 
                  className="disco-button" 
                  onClick={() => navigate(`/events/${reg.event?._id}/register`)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            <p>No upcoming events. <span style={{ color: '#00ffff', cursor: 'pointer' }} onClick={() => navigate('/events')}>Browse events</span> to register!</p>
          </div>
        )}
      </div>

      {/* Participation History Section */}
      <div className="disco-card" style={{
        padding: '1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1.5rem',
          color: '#ff00ff',
          fontFamily: "'Bungee', cursive"
        }}>
          📋 Participation History
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '20px',
                border: activeTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                background: activeTab === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.key ? tab.color : '#888',
                cursor: 'pointer',
                fontFamily: "'Anton', sans-serif",
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {tab.label} ({summary?.[tab.key === 'cancelled' ? 'cancelledRejected' : tab.key]?.length || 0})
            </button>
          ))}
        </div>

        {/* Event Records Table */}
        <div style={{ overflowX: 'auto' }}>
          {getTabData().length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>Event Name</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>Type</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>Organizer</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>Status</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>Team</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>Ticket ID</th>
                </tr>
              </thead>
              <tbody>
                {getTabData().map((reg) => (
                  <tr key={reg._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.8rem', color: '#fff' }}>{reg.event?.eventName || '-'}</td>
                    <td style={{ padding: '0.8rem', color: '#ccc' }}>{reg.event?.eventType || '-'}</td>
                    <td style={{ padding: '0.8rem', color: '#ccc' }}>{reg.event?.organizer?.organizerName || '-'}</td>
                    <td style={{ padding: '0.8rem' }}>{getStatusBadge(reg)}</td>
                    <td style={{ padding: '0.8rem', color: '#ccc' }}>{reg.teamName || '-'}</td>
                    <td style={{ padding: '0.8rem' }}>
                      {reg.ticket?.ticketId ? (
                        <span 
                          style={{ 
                            color: '#ffff00', 
                            cursor: 'pointer', 
                            textDecoration: 'underline' 
                          }}
                          onClick={() => navigate('/tickets')}
                          title="Click to view ticket"
                        >
                          {reg.ticket.ticketId}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              <p>No records in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
