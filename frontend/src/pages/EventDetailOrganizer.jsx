import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const EventDetailOrganizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, regRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/registrations`)
        ]);

        if (eventRes.data.success) setEvent(eventRes.data.event);
        if (regRes.data.success) setRegistrations(regRes.data.registrations || []);
      } catch (err) {
        console.error('Fetch event detail error', err);
        showDiscoToast(err.response?.data?.message || 'Failed to load event', false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePublish = async () => {
    try {
      const res = await api.post(`/events/${id}/publish`);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Event published!', true);
        setEvent({ ...event, status: 'published' });
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Publish failed', false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) {
        showDiscoToast('Event deleted', true);
        navigate('/organizer/events');
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Delete failed', false);
    }
  };

  const handleVerifyPayment = async (registrationId, approve = true) => {
    try {
      const res = await api.post(`/registrations/${registrationId}/verify-payment`, { approved: approve });
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Payment verified', true);
        setRegistrations(prev => prev.map(r => r._id === registrationId ? { ...r, paymentStatus: approve ? 'paid' : 'rejected', status: approve ? 'confirmed' : r.status } : r));
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Verification failed', false);
    }
  };

  const exportCSV = () => {
    if (registrations.length === 0) {
      showDiscoToast('No registrations to export', false);
      return;
    }

    const headers = ['Name', 'Email', 'Registration Date', 'Payment Status', 'Status', 'Team Name', 'Contact'];
    const rows = registrations.map(r => [
      `${r.participant?.firstName || ''} ${r.participant?.lastName || ''}`,
      r.participant?.email || '',
      new Date(r.registeredAt).toLocaleDateString(),
      r.paymentStatus,
      r.status,
      r.teamName || 'N/A',
      r.participant?.contactNumber || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.eventName || 'event'}_participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showDiscoToast('CSV exported successfully', true);
  };

  const filteredRegistrations = registrations.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.participant?.firstName?.toLowerCase().includes(query) ||
      r.participant?.lastName?.toLowerCase().includes(query) ||
      r.participant?.email?.toLowerCase().includes(query)
    );
  });

  const analytics = {
    totalRegistrations: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    pending: registrations.filter(r => r.paymentStatus === 'pending').length,
    revenue: registrations.filter(r => r.paymentStatus === 'paid').length * (event?.registrationFee || 0),
    attendance: registrations.filter(r => r.attended).length,
    teamCompletion: event?.teamSize ? Math.round((registrations.filter(r => r.teamMembers?.length === event.teamSize).length / registrations.length) * 100) || 0 : 0
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <DiscoDecorations />
        <div style={{ padding: '4rem' }}>Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <DiscoDecorations />
        <div style={{ padding: '4rem' }}>
          <h2>Event not found</h2>
          <button className="disco-button" onClick={() => navigate('/organizer/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {event.eventName}
              </h1>
              <div style={{ color: '#00ffff', fontSize: '1rem' }}>
                {event.eventType} • Status: <span style={{ color: '#ff00ff' }}>{event.status.toUpperCase()}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {event.status === 'draft' && (
                <button className="disco-button" onClick={handlePublish}>
                  ✅ Publish
                </button>
              )}
              {(event.status === 'published' || event.status === 'ongoing' || event.status === 'completed') && (
                <button className="disco-button" onClick={() => navigate(`/events/${id}/attendance`)}>
                  📱 QR Scanner
                </button>
              )}
              <button className="disco-button" onClick={() => navigate(`/organizer/events`)}>
                📋 Back
              </button>
              <button className="disco-button" onClick={handleDelete} style={{ background: 'linear-gradient(90deg,#ff006e,#ff8fab)' }}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {['overview', 'analytics', 'participants'].map(tab => (
            <button
              key={tab}
              className="disco-button"
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'linear-gradient(90deg, #ff006e, #ffbe0b)' : 'rgba(255,255,255,0.1)',
                opacity: activeTab === tab ? 1 : 0.6
              }}
            >
              {tab === 'overview' && '📄 Overview'}
              {tab === 'analytics' && '📊 Analytics'}
              {tab === 'participants' && '👥 Participants'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="disco-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#ffff00', marginBottom: '0.5rem' }}>📝 Description</h3>
                <p style={{ color: '#ddd', lineHeight: '1.6' }}>{event.eventDescription}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>📅 Dates</h4>
                  <div style={{ color: '#ddd' }}>
                    Start: {event.eventStartDate ? new Date(event.eventStartDate).toLocaleString() : 'TBA'}
                  </div>
                  <div style={{ color: '#ddd' }}>
                    End: {event.eventEndDate ? new Date(event.eventEndDate).toLocaleString() : 'TBA'}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>🎫 Registration</h4>
                  <div style={{ color: '#ddd' }}>
                    Deadline: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'TBA'}
                  </div>
                  <div style={{ color: '#ddd' }}>
                    Limit: {event.registrationLimit || '∞'}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>💰 Pricing</h4>
                  <div style={{ color: '#ddd' }}>Fee: ₹{event.registrationFee || 0}</div>
                </div>

                {event.venue && (
                  <div>
                    <h4 style={{ color: '#00ffff', marginBottom: '0.5rem' }}>📍 Venue</h4>
                    <div style={{ color: '#ddd' }}>{event.venue}</div>
                  </div>
                )}
              </div>

              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 style={{ color: '#ff00ff', marginBottom: '0.5rem' }}>🏷️ Tags</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {event.tags.map((tag, idx) => (
                      <span key={idx} style={{ background: 'rgba(255,0,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="disco-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', marginBottom: '1.5rem' }}>📊 Event Analytics</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(0,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,255,0.3)' }}>
                <div style={{ fontSize: '2rem', fontFamily: "'Bungee', cursive", color: '#00ffff' }} className="glow-text">
                  {analytics.totalRegistrations}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Registrations</div>
              </div>

              <div style={{ background: 'rgba(0,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,0,0.3)' }}>
                <div style={{ fontSize: '2rem', fontFamily: "'Bungee', cursive", color: '#00ff00' }} className="glow-text">
                  {analytics.confirmed}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Confirmed</div>
              </div>

              <div style={{ background: 'rgba(255,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,0,0.3)' }}>
                <div style={{ fontSize: '2rem', fontFamily: "'Bungee', cursive", color: '#ffff00' }} className="glow-text">
                  {analytics.pending}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Pending Payment</div>
              </div>

              <div style={{ background: 'rgba(255,0,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,255,0.3)' }}>
                <div style={{ fontSize: '2rem', fontFamily: "'Bungee', cursive", color: '#ff00ff' }} className="glow-text">
                  ₹{analytics.revenue}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Revenue</div>
              </div>

              <div style={{ background: 'rgba(255,0,110,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,110,0.3)' }}>
                <div style={{ fontSize: '2rem', fontFamily: "'Bungee', cursive", color: '#ff006e' }} className="glow-text">
                  {analytics.attendance}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Attended</div>
              </div>

              {event.teamSize && (
                <div style={{ background: 'rgba(0,200,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,200,255,0.3)' }}>
                  <div style={{ fontSize: '2rem', fontFamily: "'Bungee', cursive", color: '#00c8ff' }} className="glow-text">
                    {analytics.teamCompletion}%
                  </div>
                  <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Team Completion</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="disco-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>👥 Participants ({filteredRegistrations.length})</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(event.status === 'published' || event.status === 'ongoing' || event.status === 'completed') && (
                  <button className="disco-button" onClick={() => navigate(`/events/${id}/attendance`)}>
                    📱 QR Scanner
                  </button>
                )}
                <button className="disco-button" onClick={exportCSV}>
                  📥 Export CSV
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="disco-input"
              style={{ marginBottom: '1.5rem', width: '100%' }}
            />

            {filteredRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                {searchQuery ? 'No participants match your search' : 'No registrations yet'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {filteredRegistrations.map(r => (
                  <div key={r._id} className="event-card-disco" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {r.participant?.firstName} {r.participant?.lastName}
                      </div>
                      <div style={{ color: '#00ffff', fontSize: '0.9rem' }}>{r.participant?.email}</div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ddd' }}>
                        Registered: {new Date(r.registeredAt).toLocaleDateString()} • 
                        Payment: <span style={{ color: r.paymentStatus === 'paid' ? '#00ff00' : r.paymentStatus === 'pending' ? '#ffff00' : '#ff0000' }}>{r.paymentStatus}</span> • 
                        Status: <span style={{ color: r.status === 'confirmed' ? '#00ff00' : '#ffff00' }}>{r.status}</span>
                        {r.teamName && ` • Team: ${r.teamName}`}
                        {r.attended && ' • ✅ Attended'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      {r.paymentStatus === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="disco-button" 
                            onClick={() => handleVerifyPayment(r._id, true)}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                          >
                            ✅ Approve
                          </button>
                          <button 
                            className="disco-button" 
                            onClick={() => handleVerifyPayment(r._id, false)}
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(90deg,#ff006e,#ff8fab)' }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                      <button 
                        className="disco-button" 
                        onClick={() => navigator.clipboard.writeText(r.participant?.email || '')}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                      >
                        📧 Copy Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailOrganizer;
