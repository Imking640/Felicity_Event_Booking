import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Pre-filled participant info (editable)
  const [participantInfo, setParticipantInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    college: ''
  });
  
  // Custom form data
  const [customFormData, setCustomFormData] = useState({});
  
  // Merchandise details
  const [merchandiseDetails, setMerchandiseDetails] = useState({
    selectedVariants: {},
    quantity: 1
  });

  useEffect(() => {
    if (!isAuthenticated) {
      showDiscoToast('Please login to register for events', false);
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'participant') {
      showDiscoToast('Only participants can register for events', false);
      navigate('/events');
      return;
    }

    // Pre-fill participant info from user data
    if (user) {
      setParticipantInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        college: user.college || ''
      });
    }

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
        
        // Initialize custom form data with empty values
        if (res.data.event.customForm && res.data.event.customForm.length > 0) {
          const initialData = {};
          res.data.event.customForm.forEach(field => {
            if (field.fieldType === 'checkbox') {
              initialData[field.fieldName] = [];
            } else {
              initialData[field.fieldName] = '';
            }
          });
          setCustomFormData(initialData);
        }
        
        // Initialize merchandise variants
        if (res.data.event.eventType === 'Merchandise' && res.data.event.merchandiseDetails?.variants) {
          const initialVariants = {};
          res.data.event.merchandiseDetails.variants.forEach(v => {
            initialVariants[v.name] = v.options[0] || '';
          });
          setMerchandiseDetails(prev => ({
            ...prev,
            selectedVariants: initialVariants
          }));
        }
      }
    } catch (err) {
      showDiscoToast('Failed to load event details', false);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setParticipantInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (fieldName, value, fieldType) => {
    if (fieldType === 'checkbox') {
      setCustomFormData(prev => {
        const current = prev[fieldName] || [];
        if (current.includes(value)) {
          return { ...prev, [fieldName]: current.filter(v => v !== value) };
        } else {
          return { ...prev, [fieldName]: [...current, value] };
        }
      });
    } else {
      setCustomFormData(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleMerchandiseChange = (variantName, value) => {
    setMerchandiseDetails(prev => ({
      ...prev,
      selectedVariants: { ...prev.selectedVariants, [variantName]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required custom fields
      if (event.customForm && event.customForm.length > 0) {
        for (const field of event.customForm) {
          if (field.isRequired) {
            const value = customFormData[field.fieldName];
            if (!value || (Array.isArray(value) && value.length === 0)) {
              showDiscoToast(`Please fill in "${field.fieldName}"`, false);
              setSubmitting(false);
              return;
            }
          }
        }
      }

      const payload = {
        customFormData: {
          // Include participant info in custom form data for record
          participantFirstName: participantInfo.firstName,
          participantLastName: participantInfo.lastName,
          participantEmail: participantInfo.email,
          participantContact: participantInfo.contactNumber,
          participantCollege: participantInfo.college,
          ...customFormData
        }
      };

      // Add merchandise details if applicable
      if (event.eventType === 'Merchandise') {
        payload.merchandiseDetails = merchandiseDetails;
      }

      const res = await api.post(`/events/${id}/register`, payload);

      if (res.data.success) {
        createConfetti();
        showDiscoToast('🎉 Registration successful! Check your email for ticket.', true);
        navigate('/tickets');
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to register', false);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCustomField = (field) => {
    const { fieldName, fieldType, options, isRequired, placeholder } = field;
    const value = customFormData[fieldName];

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <input
            type={fieldType === 'phone' ? 'tel' : fieldType}
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.value, fieldType)}
            placeholder={placeholder || `Enter ${fieldName}`}
            className="disco-input"
            required={isRequired}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.value, fieldType)}
            placeholder={placeholder || `Enter ${fieldName}`}
            className="disco-input"
            rows={4}
            required={isRequired}
          />
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.value, fieldType)}
            className="disco-input"
            required={isRequired}
          >
            <option value="">Select {fieldName}</option>
            {options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {options?.map((opt, i) => (
              <label key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt)}
                  onChange={() => handleCustomFieldChange(fieldName, opt, 'checkbox')}
                />
                <span style={{ color: '#fff' }}>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.files[0]?.name || '', fieldType)}
            className="disco-input"
            style={{ padding: '0.8rem' }}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.value, fieldType)}
            placeholder={placeholder || `Enter ${fieldName}`}
            className="disco-input"
          />
        );
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)'
      }}>
        <DiscoDecorations />
        <div style={{ fontSize: '4rem', animation: 'spin-vinyl 2s linear infinite' }}>💿</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <DiscoDecorations />
        <h2>Event not found</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Event Header */}
        <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontFamily: "'Bungee', cursive", 
            color: '#ffff00', 
            marginBottom: '0.5rem',
            fontSize: '1.8rem'
          }}>
            🎟️ Register for Event
          </h1>
          <h2 style={{ 
            fontFamily: "'Bungee', cursive", 
            color: '#ff00ff', 
            marginBottom: '0.5rem',
            fontSize: '1.4rem'
          }}>
            {event.eventName}
          </h2>
          <div style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>
            {event.eventType} • {new Date(event.eventStartDate).toLocaleDateString()} • ₹{event.registrationFee || 0}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pre-filled Participant Information */}
          <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontFamily: "'Bungee', cursive", 
              color: '#ff00ff', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👤 Your Information
            </h3>
            <p style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '1rem' }}>
              This information is pre-filled from your profile. You can edit if needed.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="disco-label">First Name *</label>
                <input
                  name="firstName"
                  value={participantInfo.firstName}
                  onChange={handleParticipantChange}
                  className="disco-input"
                  required
                />
              </div>
              <div>
                <label className="disco-label">Last Name *</label>
                <input
                  name="lastName"
                  value={participantInfo.lastName}
                  onChange={handleParticipantChange}
                  className="disco-input"
                  required
                />
              </div>
              <div>
                <label className="disco-label">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={participantInfo.email}
                  onChange={handleParticipantChange}
                  className="disco-input"
                  required
                />
              </div>
              <div>
                <label className="disco-label">Contact Number</label>
                <input
                  name="contactNumber"
                  value={participantInfo.contactNumber}
                  onChange={handleParticipantChange}
                  className="disco-input"
                  placeholder="Your phone number"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="disco-label">College / Institution</label>
                <input
                  name="college"
                  value={participantInfo.college}
                  onChange={handleParticipantChange}
                  className="disco-input"
                  placeholder="Your college or institution"
                />
              </div>
            </div>
          </div>

          {/* Merchandise Details */}
          {event.eventType === 'Merchandise' && event.merchandiseDetails && (
            <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontFamily: "'Bungee', cursive", 
                color: '#ff00ff', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🛍️ Merchandise Options
              </h3>
              
              {event.merchandiseDetails.variants?.map((variant, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <label className="disco-label">{variant.name} *</label>
                  <select
                    value={merchandiseDetails.selectedVariants[variant.name] || ''}
                    onChange={(e) => handleMerchandiseChange(variant.name, e.target.value)}
                    className="disco-input"
                    required
                  >
                    {variant.options?.map((opt, j) => (
                      <option key={j} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              <div>
                <label className="disco-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={event.merchandiseDetails.purchaseLimit || 5}
                  value={merchandiseDetails.quantity}
                  onChange={(e) => setMerchandiseDetails(prev => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 1 
                  }))}
                  className="disco-input"
                  style={{ maxWidth: '120px' }}
                />
                <span style={{ color: '#ccc', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  (Max: {event.merchandiseDetails.purchaseLimit || 5})
                </span>
              </div>
            </div>
          )}

          {/* Custom Form Fields */}
          {event.customForm && event.customForm.length > 0 && (
            <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontFamily: "'Bungee', cursive", 
                color: '#ff00ff', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📋 Additional Information
              </h3>
              <p style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Please fill in the following details required by the organizer.
              </p>
              
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                {event.customForm
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((field, i) => (
                    <div key={i}>
                      <label className="disco-label">
                        {field.fieldName} {field.isRequired && '*'}
                      </label>
                      {renderCustomField(field)}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Summary and Submit */}
          <div className="disco-card" style={{ padding: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(255,255,0,0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,0,0.3)'
            }}>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.1rem' }}>
                Registration Fee
              </span>
              <span style={{ 
                fontFamily: "'Bungee', cursive", 
                fontSize: '1.5rem', 
                color: '#ffff00',
                textShadow: '0 0 10px rgba(255,255,0,0.5)'
              }}>
                ₹{event.eventType === 'Merchandise' 
                  ? (event.registrationFee || 0) * merchandiseDetails.quantity 
                  : event.registrationFee || 0}
              </span>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="disco-button"
              style={{ 
                width: '100%', 
                padding: '1rem',
                fontSize: '1.1rem',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? '⏳ Processing...' : '🎟️ Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistration;
