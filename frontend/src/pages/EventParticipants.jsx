import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { createConfetti, showDiscoToast } from '../components/DiscoDecorations';
import DiscoDecorations from '../components/DiscoDecorations';

const EventParticipants = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, rejected

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      console.error('Fetch event error', err);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}/registrations`);
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Fetch registrations error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to load participants', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
    // eslint-disable-next-line
  }, [id]);

  const handleVerify = async (registrationId, approve = true) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'APPROVE' : 'REJECT'} this payment?`)) return;
    try {
      const res = await api.post(`/registrations/${registrationId}/verify-payment`, { approved: approve });
      if (res.data.success) {
        if (approve) createConfetti();
        showDiscoToast(approve ? 'Payment approved! Ticket sent.' : 'Payment rejected.', approve);
        fetchRegistrations();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Verification failed', false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending' || r.paymentProofStatus === 'pending';
    if (filter === 'confirmed') return r.status === 'confirmed';
    if (filter === 'rejected') return r.status === 'rejected';
    return true;
  });

  const getStatusCounts = () => {
    const pending = registrations.filter(r => r.status === 'pending' || r.paymentProofStatus === 'pending').length;
    const confirmed = registrations.filter(r => r.status === 'confirmed').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;
    return { pending, confirmed, rejected };
  };

  const counts = getStatusCounts();
  const isPaidEvent = event && event.registrationFee > 0;

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '0.5rem' }}>
          👥 Participants
        </h2>
        {event && (
          <p style={{ color: '#00ffff', marginBottom: '1.5rem' }}>
            {event.eventName} • {event.eventType} • ₹{event.registrationFee || 0}
          </p>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${registrations.length})` },
            { key: 'pending', label: `⏳ Pending (${counts.pending})` },
            { key: 'confirmed', label: `✅ Confirmed (${counts.confirmed})` },
            { key: 'rejected', label: `❌ Rejected (${counts.rejected})` }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '20px',
                border: filter === f.key ? '2px solid #ffff00' : '2px solid rgba(255,255,255,0.2)',
                background: filter === f.key ? 'rgba(255,255,0,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontFamily: "'Anton', sans-serif"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '2rem' }}>Loading participants...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ padding: '2rem' }}>No {filter !== 'all' ? filter : ''} registrations found.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredRegistrations.map(r => (
              <div 
                key={r._id} 
                className="disco-card" 
                style={{ 
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: isPaidEvent && r.paymentProof ? '1fr auto' : '1fr',
                  gap: '1.5rem',
                  alignItems: 'start'
                }}
              >
                {/* Left: Participant Details */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                    {r.participant?.firstName} {r.participant?.lastName}
                  </div>
                  <div style={{ color: '#00ffff', marginBottom: '0.5rem' }}>{r.participant?.email}</div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    flexWrap: 'wrap',
                    marginBottom: '0.8rem',
                    fontSize: '0.9rem'
                  }}>
                    <span>
                      Registered: <strong>{r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : 'Invalid Date'}</strong>
                    </span>
                    <span>
                      Payment: <strong style={{ 
                        color: r.paymentStatus === 'paid' ? '#00ff88' : 
                               r.paymentStatus === 'pending' ? '#ffff00' : '#ff6666'
                      }}>
                        {r.paymentStatus}
                      </strong>
                    </span>
                    <span>
                      Status: <strong style={{ 
                        color: r.status === 'confirmed' ? '#00ff88' : 
                               r.status === 'pending' ? '#ffff00' : '#ff6666'
                      }}>
                        {r.status}
                      </strong>
                    </span>
                  </div>

                  {/* Merchandise Details */}
                  {r.merchandiseDetails && (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      padding: '0.8rem', 
                      borderRadius: '10px',
                      marginBottom: '0.8rem',
                      fontSize: '0.9rem'
                    }}>
                      <strong>📦 Order Details:</strong>
                      <div>Quantity: {r.merchandiseDetails.quantity || 1}</div>
                      {r.merchandiseDetails.selectedVariants && Object.entries(r.merchandiseDetails.selectedVariants).map(([k, v]) => (
                        <div key={k}>{k}: {v}</div>
                      ))}
                    </div>
                  )}

                  {/* Custom Form Data */}
                  {r.customFormData && Object.keys(r.customFormData).length > 0 && (
                    <div style={{ 
                      background: 'rgba(0,255,255,0.1)', 
                      padding: '0.8rem', 
                      borderRadius: '10px',
                      marginBottom: '0.8rem',
                      fontSize: '0.85rem'
                    }}>
                      <strong>📝 Form Responses:</strong>
                      {Object.entries(r.customFormData).map(([k, v]) => (
                        <div key={k}>{k}: {Array.isArray(v) ? v.join(', ') : v}</div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {/* Show approve/reject for pending payments with proof uploaded */}
                    {isPaidEvent && r.paymentProof && r.paymentProofStatus !== 'approved' && r.status !== 'confirmed' && (
                      <>
                        <button 
                          className="disco-button" 
                          onClick={() => handleVerify(r._id, true)}
                          style={{ background: 'linear-gradient(90deg, #00ff88, #00cc66)' }}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="disco-button" 
                          onClick={() => handleVerify(r._id, false)}
                          style={{ background: 'linear-gradient(90deg, #ff006e, #ff4444)' }}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    
                    {/* Show waiting message if payment proof not uploaded yet */}
                    {isPaidEvent && !r.paymentProof && r.status === 'pending' && (
                      <span style={{ 
                        padding: '0.5rem 1rem', 
                        background: 'rgba(255,165,0,0.2)', 
                        borderRadius: '10px',
                        color: '#ffa500',
                        fontSize: '0.85rem'
                      }}>
                        ⏳ Waiting for payment proof upload
                      </span>
                    )}
                    
                    <button 
                      className="disco-button" 
                      onClick={() => navigator.clipboard.writeText(r.participant?.email || '').then(() => showDiscoToast('Email copied!', true))}
                    >
                      📧 Copy Email
                    </button>
                  </div>
                </div>

                {/* Right: Payment Proof Image */}
                {isPaidEvent && r.paymentProof && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#ffff00', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      💳 Payment Proof
                    </div>
                    <img
                      src={r.paymentProof}
                      alt="Payment Proof"
                      onClick={() => setSelectedImage(r.paymentProof)}
                      style={{
                        width: '180px',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '15px',
                        border: r.paymentProofStatus === 'approved' 
                          ? '3px solid #00ff88' 
                          : r.paymentProofStatus === 'rejected'
                          ? '3px solid #ff4444'
                          : '3px solid #ffff00',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div 
                      style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.8rem', 
                        color: '#00ffff',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedImage(r.paymentProof)}
                    >
                      🔍 Click to enlarge
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              cursor: 'pointer',
              padding: '2rem'
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={selectedImage}
                alt="Payment Proof Enlarged"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '20px',
                  border: '3px solid #ffff00'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                color: '#fff',
                fontSize: '0.9rem'
              }}>
                Click anywhere to close
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventParticipants;
