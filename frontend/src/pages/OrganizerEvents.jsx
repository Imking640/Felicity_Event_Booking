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
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Change event status to "${newStatus}"?`)) return;
    try {
      const res = await api.put(`/events/${id}`, { status: newStatus });
      if (res.data.success) {
        showDiscoToast(`Event marked as ${newStatus}`, true);
        fetchEvents();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Status change failed', false);
    }
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setEditForm({
      eventDescription: ev.eventDescription || '',
      registrationDeadline: ev.registrationDeadline ? ev.registrationDeadline.split('T')[0] : '',
      registrationLimit: ev.registrationLimit || ''
    });
  };

  const handleEditSave = async () => {
    try {
      const payload = {};
      
      // For draft events, can edit everything
      if (editingEvent.status === 'draft') {
        payload.eventDescription = editForm.eventDescription;
        payload.registrationDeadline = editForm.registrationDeadline;
        payload.registrationLimit = parseInt(editForm.registrationLimit) || undefined;
      } else if (editingEvent.status === 'published') {
        // For published events, only certain fields
        payload.eventDescription = editForm.eventDescription;
        if (editForm.registrationDeadline) {
          payload.registrationDeadline = editForm.registrationDeadline;
        }
        if (editForm.registrationLimit && parseInt(editForm.registrationLimit) > (editingEvent.registrationLimit || 0)) {
          payload.registrationLimit = parseInt(editForm.registrationLimit);
        }
      }

      const res = await api.put(`/events/${editingEvent._id}`, payload);
      if (res.data.success) {
        showDiscoToast('Event updated!', true);
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Update failed', false);
    }
  };

  const getEditableFields = (status) => {
    if (status === 'draft') return ['eventDescription', 'registrationDeadline', 'registrationLimit'];
    if (status === 'published') return ['eventDescription', 'registrationDeadline', 'registrationLimit'];
    return [];
  };

  const canEdit = (status) => {
    return status === 'draft' || status === 'published';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#ffff00';
      case 'published': return '#00ff88';
      case 'ongoing': return '#00ffff';
      case 'completed': return '#888';
      case 'cancelled': return '#ff4444';
      default: return '#fff';
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>📋 My Events</h2>
          <div>
            <Link to="/create-event" className="disco-button">➕ Create New</Link>
          </div>
        </div>

        {/* Editing Rules Info */}
        <div className="disco-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <h4 style={{ color: '#ffff00', marginBottom: '0.5rem' }}>📝 Editing Rules:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <div><span style={{ color: '#ffff00' }}>Draft:</span> Full edits allowed, can be published</div>
            <div><span style={{ color: '#00ff88' }}>Published:</span> Edit description, extend deadline, increase limit</div>
            <div><span style={{ color: '#00ffff' }}>Ongoing/Completed:</span> Status change only</div>
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
              <div key={ev._id} className="event-card-disco" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ margin: 0 }}>{ev.eventName}</h3>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {ev.eventType} • {ev.eventStartDate ? new Date(ev.eventStartDate).toLocaleDateString() : 'TBA'}
                  </div>
                  <div style={{ color: '#ddd', marginTop: '0.25rem' }}>
                    {ev.eventDescription?.substring(0, 120)}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>
                      Status: <strong style={{ color: getStatusColor(ev.status) }}>{ev.status?.toUpperCase()}</strong>
                    </span>
                    <span>
                      Registrations: {ev.currentRegistrations || 0}/{ev.registrationLimit || '∞'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button className="disco-button" onClick={() => navigate(`/events/${ev._id}`)}>View</button>
                  <button className="disco-button" onClick={() => navigate(`/events/${ev._id}/participants`)}>Participants</button>
                  
                  {/* Edit Button - only for draft/published */}
                  {canEdit(ev.status) && (
                    <button 
                      className="disco-button" 
                      onClick={() => openEditModal(ev)}
                      style={{ background: 'linear-gradient(90deg, #00ffff, #0088ff)' }}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  
                  {/* Publish Button - only for draft */}
                  {ev.status === 'draft' && (
                    <button className="disco-button" onClick={() => handlePublish(ev._id)}>🚀 Publish</button>
                  )}
                  
                  {/* Close Registrations - only for published */}
                  {ev.status === 'published' && (
                    <button 
                      className="disco-button" 
                      onClick={() => handleStatusChange(ev._id, 'ongoing')}
                      style={{ background: 'linear-gradient(90deg, #ff8800, #ffcc00)' }}
                    >
                      🔒 Close Reg
                    </button>
                  )}
                  
                  {/* Mark Complete - for ongoing */}
                  {ev.status === 'ongoing' && (
                    <button 
                      className="disco-button" 
                      onClick={() => handleStatusChange(ev._id, 'completed')}
                      style={{ background: 'linear-gradient(90deg, #00ff88, #00cc66)' }}
                    >
                      ✅ Complete
                    </button>
                  )}
                  
                  {/* Delete - only for draft or events with no registrations */}
                  {(ev.status === 'draft' || ev.currentRegistrations === 0) && (
                    <button 
                      className="disco-button" 
                      onClick={() => handleDelete(ev._id)} 
                      style={{ background: 'linear-gradient(90deg, #ff006e, #ff8fab)' }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingEvent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="disco-card" style={{ 
              maxWidth: 500, 
              width: '100%', 
              padding: '2rem',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h3 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1rem' }}>
                ✏️ Edit Event
              </h3>
              <p style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <strong>{editingEvent.eventName}</strong> ({editingEvent.status})
              </p>
              
              {editingEvent.status === 'published' && (
                <div style={{ 
                  background: 'rgba(255,255,0,0.1)', 
                  padding: '0.8rem', 
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255,255,0,0.3)'
                }}>
                  ⚠️ Published events: You can only update description, extend deadline, or increase limit.
                </div>
              )}

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif", display: 'block', marginBottom: '0.3rem' }}>
                    Description
                  </label>
                  <textarea
                    value={editForm.eventDescription}
                    onChange={e => setEditForm({ ...editForm, eventDescription: e.target.value })}
                    className="disco-input"
                    rows={4}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif", display: 'block', marginBottom: '0.3rem' }}>
                    Registration Deadline
                    {editingEvent.status === 'published' && (
                      <span style={{ color: '#ffff00', fontSize: '0.8rem' }}> (can only extend)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={editForm.registrationDeadline}
                    onChange={e => setEditForm({ ...editForm, registrationDeadline: e.target.value })}
                    className="disco-input"
                    style={{ width: '100%' }}
                    min={editingEvent.status === 'published' ? editingEvent.registrationDeadline?.split('T')[0] : undefined}
                  />
                </div>

                <div>
                  <label style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif", display: 'block', marginBottom: '0.3rem' }}>
                    Registration Limit
                    {editingEvent.status === 'published' && (
                      <span style={{ color: '#ffff00', fontSize: '0.8rem' }}> (can only increase, current: {editingEvent.registrationLimit || '∞'})</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={editForm.registrationLimit}
                    onChange={e => setEditForm({ ...editForm, registrationLimit: e.target.value })}
                    className="disco-input"
                    style={{ width: '100%' }}
                    min={editingEvent.status === 'published' ? (editingEvent.registrationLimit || 0) : 0}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleEditSave}
                  className="disco-button"
                  style={{ flex: 1 }}
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={() => setEditingEvent(null)}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerEvents;
