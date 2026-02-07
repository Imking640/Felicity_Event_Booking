import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
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
    eligibility: 'All' // All, IIIT Only, Non-IIIT Only
  });

  // Custom form fields for registration
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState({
    fieldName: '',
    fieldType: 'text',
    isRequired: false,
    placeholder: '',
    options: ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleNewFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addCustomField = () => {
    if (!newField.fieldName.trim()) {
      showDiscoToast('Please enter a field name', false);
      return;
    }

    const field = {
      ...newField,
      options: newField.fieldType === 'dropdown' || newField.fieldType === 'checkbox' 
        ? newField.options.split(',').map(o => o.trim()).filter(o => o)
        : [],
      order: customFields.length
    };

    setCustomFields(prev => [...prev, field]);
    setNewField({
      fieldName: '',
      fieldType: 'text',
      isRequired: false,
      placeholder: '',
      options: ''
    });
    showDiscoToast('Field added!', true);
  };

  const removeCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const newFields = [...customFields];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newFields.length) return;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setCustomFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        customForm: customFields.length > 0 ? customFields : undefined
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Event created as draft! Publish it when ready.', true);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Create event error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to create event', false);
    } finally {
      setLoading(false);
    }
  };

  const fieldTypeIcons = {
    text: '📝',
    textarea: '📄',
    number: '🔢',
    email: '📧',
    phone: '📱',
    dropdown: '📋',
    checkbox: '☑️',
    file: '📎'
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '0.5rem' }}>
            ➕ Create Event
          </h1>
          <p style={{ color: '#00ffff' }}>
            Create a new event (saved as draft). You can publish it later after adding all details.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
              📋 Basic Information
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="disco-label">📌 Event Name *</label>
                <input 
                  name="eventName" 
                  value={form.eventName} 
                  onChange={handleChange} 
                  placeholder="Enter event name (e.g., Hackathon 2026)" 
                  className="disco-input" 
                  required 
                />
              </div>
              
              <div>
                <label className="disco-label">📝 Description *</label>
                <textarea 
                  name="eventDescription" 
                  value={form.eventDescription} 
                  onChange={handleChange} 
                  placeholder="Describe your event - what it's about, who can participate, what will happen..." 
                  className="disco-input" 
                  rows={5} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="disco-label">📂 Event Type *</label>
                  <select 
                    name="eventType" 
                    value={form.eventType} 
                    onChange={handleChange} 
                    className="disco-input"
                  >
                    <option value="Normal">Normal Event</option>
                    <option value="Merchandise">Merchandise</option>
                  </select>
                </div>

                <div>
                  <label className="disco-label">📍 Venue *</label>
                  <input 
                    name="venue" 
                    value={form.venue} 
                    onChange={handleChange} 
                    placeholder="e.g., Main Auditorium, Online" 
                    className="disco-input" 
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Timing */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#00ffff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
              📅 Dates & Timing
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label className="disco-label">🗓️ Event Start Date *</label>
                <input 
                  type="date" 
                  name="eventStartDate" 
                  value={form.eventStartDate} 
                  onChange={handleChange} 
                  className="disco-input" 
                  required 
                />
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                  When does the event begin?
                </div>
              </div>
              
              <div>
                <label className="disco-label">🏁 Event End Date *</label>
                <input 
                  type="date" 
                  name="eventEndDate" 
                  value={form.eventEndDate} 
                  onChange={handleChange} 
                  className="disco-input" 
                  required 
                />
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                  When does the event end?
                </div>
              </div>
              
              <div>
                <label className="disco-label">⏰ Registration Deadline *</label>
                <input 
                  type="date" 
                  name="registrationDeadline" 
                  value={form.registrationDeadline} 
                  onChange={handleChange} 
                  className="disco-input" 
                  required
                />
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                  Last date to register
                </div>
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
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                  Maximum number of registrations
                </div>
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
                />
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                  0 for free events
                </div>
              </div>

              <div>
                <label className="disco-label">🎓 Eligibility</label>
                <select 
                  name="eligibility" 
                  value={form.eligibility} 
                  onChange={handleChange} 
                  className="disco-input"
                >
                  <option value="All">All Participants</option>
                  <option value="IIIT Only">IIIT Students Only</option>
                  <option value="Non-IIIT Only">Non-IIIT Only</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                  Who can register?
                </div>
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
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
              Help participants find your event with relevant tags
            </div>
          </div>

          {/* Custom Registration Form Builder */}
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#8a2be2', margin: 0, fontFamily: "'Bungee', cursive" }}>
                📝 Custom Registration Form
              </h3>
            </div>
            
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Create a custom form that participants will fill out during registration.
              <br />
              <span style={{ color: '#ffff00' }}>⚠️ Note: Form cannot be edited after the first registration.</span>
            </p>

            {/* Toggle to create custom form */}
            {!showFormBuilder && customFields.length === 0 && (
              <button 
                type="button"
                className="disco-button"
                onClick={() => setShowFormBuilder(true)}
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #8a2be2, #6a1bb2)'
                }}
              >
                ➕ Create Custom Form
              </button>
            )}

            {/* Current Custom Fields */}
            {customFields.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: '#00ffff', margin: 0 }}>Form Fields ({customFields.length})</h4>
                  <button 
                    type="button"
                    className="disco-button"
                    onClick={() => setShowFormBuilder(!showFormBuilder)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    {showFormBuilder ? '➖ Close' : '➕ Add More'}
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {customFields.map((field, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        background: 'rgba(138,43,226,0.1)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(138,43,226,0.3)'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{fieldTypeIcons[field.fieldType]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>
                          {field.fieldName}
                          {field.isRequired && <span style={{ color: '#ff6b6b', marginLeft: '0.25rem' }}>*</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          Type: {field.fieldType}
                          {field.options?.length > 0 && ` | Options: ${field.options.join(', ')}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          type="button"
                          onClick={() => moveField(index, -1)}
                          disabled={index === 0}
                          style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            border: 'none', 
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            opacity: index === 0 ? 0.5 : 1
                          }}
                        >
                          ⬆️
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveField(index, 1)}
                          disabled={index === customFields.length - 1}
                          style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            border: 'none', 
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: index === customFields.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: index === customFields.length - 1 ? 0.5 : 1
                          }}
                        >
                          ⬇️
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeCustomField(index)}
                          style={{ 
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Field Form */}
            {showFormBuilder && (
              <div style={{ 
                background: 'rgba(138,43,226,0.1)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                border: '2px solid rgba(138,43,226,0.3)'
              }}>
                <h4 style={{ color: '#8a2be2', marginBottom: '1rem' }}>Add New Field</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="disco-label">Field Name *</label>
                    <input 
                      name="fieldName"
                      value={newField.fieldName}
                      onChange={handleNewFieldChange}
                      placeholder="e.g., T-Shirt Size, GitHub URL"
                      className="disco-input"
                    />
                  </div>
                  
                  <div>
                    <label className="disco-label">Field Type</label>
                    <select 
                      name="fieldType"
                      value={newField.fieldType}
                      onChange={handleNewFieldChange}
                      className="disco-input"
                    >
                      <option value="text">📝 Text (Short Answer)</option>
                      <option value="textarea">📄 Textarea (Long Answer)</option>
                      <option value="number">🔢 Number</option>
                      <option value="email">📧 Email</option>
                      <option value="phone">📱 Phone</option>
                      <option value="dropdown">📋 Dropdown (Select One)</option>
                      <option value="checkbox">☑️ Checkbox (Multiple Select)</option>
                      <option value="file">📎 File Upload</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="disco-label">Placeholder Text</label>
                    <input 
                      name="placeholder"
                      value={newField.placeholder}
                      onChange={handleNewFieldChange}
                      placeholder="Hint text shown in the field"
                      className="disco-input"
                    />
                  </div>
                  
                  {(newField.fieldType === 'dropdown' || newField.fieldType === 'checkbox') && (
                    <div>
                      <label className="disco-label">Options (comma separated) *</label>
                      <input 
                        name="options"
                        value={newField.options}
                        onChange={handleNewFieldChange}
                        placeholder="e.g., S, M, L, XL"
                        className="disco-input"
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      name="isRequired"
                      checked={newField.isRequired}
                      onChange={handleNewFieldChange}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ color: '#fff' }}>Required Field</span>
                  </label>
                  
                  <button 
                    type="button"
                    className="disco-button"
                    onClick={addCustomField}
                    style={{ marginLeft: 'auto' }}
                  >
                    ➕ Add Field
                  </button>
                </div>
              </div>
            )}
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
                {loading ? '⏳ Creating...' : '✨ Create Event (Draft)'}
              </button>
              <button 
                type="button" 
                className="disco-button" 
                onClick={() => navigate('/dashboard')} 
                style={{ padding: '1rem 2rem', background: 'linear-gradient(90deg,#555,#333)' }}
              >
                ❌ Cancel
              </button>
            </div>
            <p style={{ textAlign: 'center', color: '#888', marginTop: '1rem', fontSize: '0.85rem' }}>
              Your event will be saved as a draft. You can edit and publish it later from the dashboard.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
