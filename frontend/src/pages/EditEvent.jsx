import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [eventStatus, setEventStatus] = useState('draft');
  const [form, setForm] = useState({
    eventName: '',
    eventDescription: '',
    eventType: 'Normal',
    eventStartDate: '',
    eventEndDate: '',
    registrationLimit: 100,
    registrationFee: 0,
    registrationDeadline: '',
    venue: '',
    tags: '',
    eligibility: 'All'
  });

  // Merchandise details
  const [merchandiseDetails, setMerchandiseDetails] = useState({
    stockQuantity: 100,
    purchaseLimit: 5,
    variants: []
  });
  const [newVariant, setNewVariant] = useState({ name: '', options: '' });

  // Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        if (res.data.success) {
          const event = res.data.event;
          setEventStatus(event.status);
          setForm({
            eventName: event.eventName || '',
            eventDescription: event.eventDescription || '',
            eventType: event.eventType || 'Normal',
            eventStartDate: event.eventStartDate ? event.eventStartDate.split('T')[0] : '',
            eventEndDate: event.eventEndDate ? event.eventEndDate.split('T')[0] : '',
            registrationLimit: event.registrationLimit || 100,
            registrationFee: event.registrationFee || 0,
            registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
            venue: event.venue || '',
            tags: (event.tags || []).join(', '),
            eligibility: event.eligibility || 'All'
          });
          if (event.merchandiseDetails) {
            setMerchandiseDetails(event.merchandiseDetails);
          }
        }
      } catch (err) {
        console.error('Fetch event error:', err);
        showDiscoToast(err.response?.data?.message || 'Failed to load event', false);
        navigate('/organizer/events');
      } finally {
        setFetching(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  // Merchandise variant handlers
  const addVariant = () => {
    if (!newVariant.name.trim()) {
      showDiscoToast('Please enter variant name', false);
      return;
    }
    if (!newVariant.options.trim()) {
      showDiscoToast('Please enter options', false);
      return;
    }
    const variant = {
      name: newVariant.name.trim(),
      options: newVariant.options.split(',').map(o => o.trim()).filter(o => o)
    };
    setMerchandiseDetails(prev => ({
      ...prev,
      variants: [...prev.variants, variant]
    }));
    setNewVariant({ name: '', options: '' });
    showDiscoToast('Variant added!', true);
  };

  const removeVariant = (index) => {
    setMerchandiseDetails(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      };

      // Add merchandise details if type is Merchandise
      if (form.eventType === 'Merchandise') {
        payload.merchandiseDetails = merchandiseDetails;
      }

      const res = await api.put(`/events/${id}`, payload);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Event updated successfully!', true);
        navigate(`/organizer/event/${id}`);
      }
    } catch (err) {
      console.error('Update event error:', err);
      showDiscoToast(err.response?.data?.message || 'Failed to update event', false);
    } finally {
      setLoading(false);
    }
  };

  // Determine which fields can be edited based on status
  const isDraft = eventStatus === 'draft';
  const isPublished = eventStatus === 'published';
  const cannotEdit = eventStatus === 'ongoing' || eventStatus === 'completed' || eventStatus === 'cancelled';

  if (fetching) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (cannotEdit) {
    return (
      <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
        <DiscoDecorations />
        <div className="disco-card" style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#ff006e', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>
            Cannot Edit Event
          </h2>
          <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
            This event is {eventStatus} and cannot be edited.
          </p>
          <button 
            className="disco-button" 
            onClick={() => navigate(`/organizer/event/${id}`)}
            style={{ padding: '0.75rem 2rem' }}
          >
            ◀ Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '0.5rem' }}>
            ✏️ Edit Event
          </h1>
          <p style={{ color: '#00ffff' }}>
            {isDraft 
              ? 'This event is a draft. You can edit all fields.' 
              : 'This event is published. Only description, deadline, limit, and tags can be edited.'}
          </p>
          {isPublished && (
            <div style={{ 
              background: 'rgba(255,255,0,0.1)', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px',
              border: '1px solid rgba(255,255,0,0.3)',
              marginTop: '1rem',
              fontSize: '0.9rem',
              color: '#ffff00'
            }}>
              ⚠️ Published events have limited editing to prevent confusion for registered participants.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
              📋 Basic Information
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="disco-label">📌 Event Name {isDraft && '*'}</label>
                <input 
                  name="eventName" 
                  value={form.eventName} 
                  onChange={handleChange} 
                  placeholder="Enter event name" 
                  className="disco-input" 
                  disabled={!isDraft}
                  required={isDraft}
                  style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>
              
              <div>
                <label className="disco-label">📝 Description *</label>
                <textarea 
                  name="eventDescription" 
                  value={form.eventDescription} 
                  onChange={handleChange} 
                  placeholder="Describe your event..." 
                  className="disco-input" 
                  rows={5} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="disco-label">📂 Event Type</label>
                  <select 
                    name="eventType" 
                    value={form.eventType} 
                    onChange={handleChange} 
                    className="disco-input"
                    disabled={!isDraft}
                    style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    <option value="Normal">Normal Event</option>
                    <option value="Merchandise">Merchandise</option>
                  </select>
                </div>

                <div>
                  <label className="disco-label">📍 Venue</label>
                  <input 
                    name="venue" 
                    value={form.venue} 
                    onChange={handleChange} 
                    placeholder="e.g., Main Auditorium" 
                    className="disco-input" 
                    disabled={!isDraft}
                    style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Merchandise Details - Only show when type is Merchandise and draft */}
          {form.eventType === 'Merchandise' && isDraft && (
            <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#ff6b00', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
                🛍️ Merchandise Details
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="disco-label">📦 Stock Quantity *</label>
                  <input 
                    type="number" 
                    value={merchandiseDetails.stockQuantity}
                    onChange={(e) => setMerchandiseDetails(prev => ({ 
                      ...prev, 
                      stockQuantity: parseInt(e.target.value) || 0 
                    }))}
                    className="disco-input" 
                    min={1}
                  />
                </div>
                
                <div>
                  <label className="disco-label">🔢 Purchase Limit per Person</label>
                  <input 
                    type="number" 
                    value={merchandiseDetails.purchaseLimit}
                    onChange={(e) => setMerchandiseDetails(prev => ({ 
                      ...prev, 
                      purchaseLimit: parseInt(e.target.value) || 1 
                    }))}
                    className="disco-input" 
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div style={{ 
                background: 'rgba(255,107,0,0.1)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                border: '1px solid rgba(255,107,0,0.3)'
              }}>
                <h4 style={{ color: '#ff6b00', marginBottom: '1rem' }}>
                  🎨 Product Variants
                </h4>
                
                {merchandiseDetails.variants.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {merchandiseDetails.variants.map((variant, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          background: 'rgba(255,255,255,0.1)',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{variant.name}:</span>
                        <span style={{ color: '#ccc' }}>{variant.options.join(', ')}</span>
                        <button 
                          type="button"
                          onClick={() => removeVariant(index)}
                          style={{ 
                            marginLeft: 'auto',
                            background: 'rgba(255,0,0,0.2)', 
                            border: 'none', 
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            color: '#ff6b6b'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                  <div>
                    <label className="disco-label" style={{ fontSize: '0.8rem' }}>Variant Name</label>
                    <input 
                      value={newVariant.name}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Size"
                      className="disco-input"
                    />
                  </div>
                  <div>
                    <label className="disco-label" style={{ fontSize: '0.8rem' }}>Options</label>
                    <input 
                      value={newVariant.options}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, options: e.target.value }))}
                      placeholder="e.g., S, M, L, XL"
                      className="disco-input"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={addVariant}
                    className="disco-button"
                    style={{ padding: '0.7rem 1rem' }}
                  >
                    ➕ Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dates & Timing */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#00ffff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
              📅 Dates & Timing
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label className="disco-label">🗓️ Event Start Date</label>
                <input 
                  type="date" 
                  name="eventStartDate" 
                  value={form.eventStartDate} 
                  onChange={handleChange} 
                  className="disco-input" 
                  disabled={!isDraft}
                  style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>
              
              <div>
                <label className="disco-label">🏁 Event End Date</label>
                <input 
                  type="date" 
                  name="eventEndDate" 
                  value={form.eventEndDate} 
                  onChange={handleChange} 
                  className="disco-input" 
                  disabled={!isDraft}
                  style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>
              
              <div>
                <label className="disco-label">⏰ Registration Deadline</label>
                <input 
                  type="date" 
                  name="registrationDeadline" 
                  value={form.registrationDeadline} 
                  onChange={handleChange} 
                  className="disco-input" 
                />
                {isPublished && (
                  <div style={{ fontSize: '0.75rem', color: '#ffff00', marginTop: '0.25rem' }}>
                    ⚠️ Can only extend, not shorten
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ffff00', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
              🎫 Registration Settings
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label className="disco-label">👥 Max Participants</label>
                <input 
                  type="number" 
                  name="registrationLimit" 
                  value={form.registrationLimit} 
                  onChange={handleChange} 
                  className="disco-input" 
                  min={1} 
                />
              </div>
              
              <div>
                <label className="disco-label">💰 Registration Fee (₹)</label>
                <input 
                  type="number" 
                  name="registrationFee" 
                  value={form.registrationFee} 
                  onChange={handleChange} 
                  className="disco-input" 
                  min={0} 
                  disabled={!isDraft}
                  style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>

              <div>
                <label className="disco-label">🎓 Eligibility</label>
                <select 
                  name="eligibility" 
                  value={form.eligibility} 
                  onChange={handleChange} 
                  className="disco-input"
                  disabled={!isDraft}
                  style={!isDraft ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  <option value="All">All Participants</option>
                  <option value="IIIT Only">IIIT Students Only</option>
                  <option value="Non-IIIT Only">Non-IIIT Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff006e', marginBottom: '1rem', fontFamily: "'Bungee', cursive" }}>
              🏷️ Tags
            </h3>
            <input 
              name="tags" 
              value={form.tags} 
              onChange={handleChange} 
              placeholder="coding, hackathon, AI, workshop (comma separated)" 
              className="disco-input" 
            />
          </div>

          {/* Submit Buttons */}
          <div className="disco-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="submit" 
                className="disco-button" 
                disabled={loading}
                style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
              >
                {loading ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button 
                type="button" 
                className="disco-button" 
                onClick={() => navigate(`/organizer/event/${id}`)} 
                style={{ padding: '1rem 2rem', background: 'linear-gradient(90deg,#555,#333)' }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
