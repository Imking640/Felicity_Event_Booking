import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';
import DiscussionForum from '../components/DiscussionForum';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom form data only
  const [customFormData, setCustomFormData] = useState({});
  
  // Merchandise details
  const [merchandiseDetails, setMerchandiseDetails] = useState({
    selectedVariants: {},
    quantity: 1
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);
  
  // Payment proof upload for merchandise
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

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

    fetchEvent();
    fetchMyRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, isAuthenticated]);

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get('/registrations');
      if (res.data.success) {
        const regs = res.data.registrations || [];
        const myReg = regs.find(r => r.event && (r.event._id === id || r.event === id));
        if (myReg) {
          setIsRegistered(true);
          setMyRegistration(myReg);
        }
      }
    } catch (err) {
      // ignore
    }
  };

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

  // Upload payment proof for merchandise
  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile) {
      showDiscoToast('Please select a payment proof image', false);
      return;
    }
    
    setUploadingProof(true);
    try {
      // Convert to base64 for now (in production, use proper file upload)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const res = await api.post(`/registrations/${myRegistration._id}/payment`, {
          paymentProof: base64
        });
        if (res.data.success) {
          showDiscoToast('Payment proof uploaded! Waiting for approval.', true);
          setMyRegistration(res.data.registration);
        }
      };
      reader.readAsDataURL(paymentProofFile);
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to upload payment proof', false);
    } finally {
      setUploadingProof(false);
    }
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

      // Only send custom form data (no pre-filled participant info)
      const payload = {
        customFormData: customFormData
      };

      // Add merchandise details if applicable
      if (event.eventType === 'Merchandise') {
        payload.merchandiseDetails = merchandiseDetails;
      }

      const res = await api.post(`/events/${id}/register`, payload);

      if (res.data.success) {
        // For merchandise with payment required, show different message
        if (event.eventType === 'Merchandise' && event.registrationFee > 0) {
          showDiscoToast('🛒 Order placed! Please upload payment proof.', true);
          setIsRegistered(true);
          setMyRegistration(res.data.registration);
        } else {
          createConfetti();
          showDiscoToast('🎉 Registration successful! Check your email for ticket.', true);
          navigate('/tickets');
        }
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
            {isRegistered ? '💬 Event Discussion' : '🎟️ Register for Event'}
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
          
          {/* Show registration status badge */}
          {isRegistered && (
            <div style={{ 
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Status badge based on registration/payment status */}
              {myRegistration?.paymentProofStatus === 'approved' || myRegistration?.status === 'confirmed' ? (
                <>
                  <span style={{
                    background: 'linear-gradient(135deg, #00ff00, #00cc00)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#000'
                  }}>
                    ✅ Registration Confirmed!
                  </span>
                  <button
                    onClick={() => navigate('/tickets')}
                    className="disco-button"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    🎟️ View Your Ticket
                  </button>
                </>
              ) : myRegistration?.paymentProofStatus === 'pending' ? (
                <span style={{
                  background: 'linear-gradient(135deg, #ffff00, #ffcc00)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#000'
                }}>
                  ⏳ Payment Proof Under Review
                </span>
              ) : myRegistration?.paymentProofStatus === 'rejected' ? (
                <span style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  ❌ Payment Rejected - Please Re-upload
                </span>
              ) : (
                <span style={{
                  background: 'linear-gradient(135deg, #ff8800, #ff6600)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#000'
                }}>
                  📤 Upload Payment Proof Below
                </span>
              )}
            </div>
          )}
        </div>

        {/* Show Registration Form ONLY if not registered */}
        {!isRegistered && (
          <form onSubmit={handleSubmit}>
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
                  �️ Merchandise Options
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

            {/* Custom Form Fields - Only show if custom form exists */}
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
                  � Registration Form
                </h3>
                <p style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Please fill in the following details to complete your registration.
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
                  {event.eventType === 'Merchandise' ? 'Total Amount' : 'Registration Fee'}
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
              
              {event.eventType === 'Merchandise' && event.registrationFee > 0 && (
                <p style={{ color: '#00ffff', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                  ⚠️ After placing order, you'll need to upload payment proof for approval
                </p>
              )}
              
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
                {submitting ? '⏳ Processing...' : 
                  event.eventType === 'Merchandise' ? '🛒 Place Order' : '🎟️ Complete Registration'}
              </button>
            </div>
          </form>
        )}
        
        {/* Payment Proof Upload for Merchandise (after registration, waiting for approval) */}
        {isRegistered && myRegistration && event.eventType === 'Merchandise' && 
         myRegistration.paymentProofStatus !== 'approved' && (
          <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontFamily: "'Bungee', cursive", 
              color: '#ff00ff', 
              marginBottom: '1rem'
            }}>
              💳 Payment Proof
            </h3>
            
            {myRegistration.paymentProofStatus === 'pending' ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ 
                  background: 'rgba(255,255,0,0.1)', 
                  padding: '1rem', 
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,0,0.3)'
                }}>
                  <span style={{ fontSize: '2rem' }}>⏳</span>
                  <p style={{ marginTop: '0.5rem', color: '#ffff00' }}>
                    Payment proof uploaded. Waiting for organizer approval.
                  </p>
                </div>
              </div>
            ) : myRegistration.paymentProofStatus === 'rejected' ? (
              <div>
                <div style={{ 
                  background: 'rgba(255,0,0,0.1)', 
                  padding: '1rem', 
                  borderRadius: '10px',
                  border: '1px solid rgba(255,0,0,0.3)',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>❌</span>
                  <p style={{ marginTop: '0.5rem', color: '#ff6b6b' }}>
                    Payment was rejected. Please upload a new proof.
                  </p>
                </div>
                
                <div>
                  <label className="disco-label">Upload Payment Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files[0])}
                    className="disco-input"
                    style={{ padding: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={handlePaymentProofUpload}
                    disabled={uploadingProof || !paymentProofFile}
                    className="disco-button"
                    style={{ marginTop: '1rem', width: '100%' }}
                  >
                    {uploadingProof ? '⏳ Uploading...' : '📤 Upload Payment Proof'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#ccc', marginBottom: '1rem' }}>
                  Please upload your payment screenshot. Amount: ₹{(event.registrationFee || 0) * (myRegistration.merchandiseDetails?.quantity || 1)}
                </p>
                <div>
                  <label className="disco-label">Upload Payment Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files[0])}
                    className="disco-input"
                    style={{ padding: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={handlePaymentProofUpload}
                    disabled={uploadingProof || !paymentProofFile}
                    className="disco-button"
                    style={{ marginTop: '1rem', width: '100%' }}
                  >
                    {uploadingProof ? '⏳ Uploading...' : '📤 Upload Payment Proof'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Show ticket link for approved merchandise */}
        {isRegistered && myRegistration && event.eventType === 'Merchandise' && 
         myRegistration.paymentProofStatus === 'approved' && (
          <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>✅</span>
            <h3 style={{ color: '#00ff88', marginTop: '0.5rem' }}>Payment Approved!</h3>
            <p style={{ color: '#ccc', marginBottom: '1rem' }}>Your order has been confirmed.</p>
            <button
              onClick={() => navigate('/tickets')}
              className="disco-button"
            >
              🎟️ View Your Ticket
            </button>
          </div>
        )}
        
        {/* Discussion Forum - always show for registered, show below form for non-registered */}
        <div style={{ marginTop: '1.5rem' }}>
          <DiscussionForum 
            eventId={event?._id || id} 
            eventOrganizerId={event?.organizer?._id || event?.organizer} 
            isRegistered={isRegistered} 
          />
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;
