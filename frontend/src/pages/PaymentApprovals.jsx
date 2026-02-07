import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PaymentApprovals = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchAllPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllPayments = async () => {
    try {
      // Get all merchandise orders for organizer's events
      const response = await api.get('/registrations/merchandise-orders');
      if (response.data.success) {
        setRegistrations(response.data.registrations);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (registrationId, approved) => {
    if (!window.confirm(`Are you sure you want to ${approved ? 'APPROVE' : 'REJECT'} this payment?`)) {
      return;
    }

    setProcessing(registrationId);
    try {
      const response = await api.post(`/registrations/${registrationId}/verify-payment`, { approved });
      
      if (response.data.success) {
        alert(response.data.message);
        // Update local state
        setRegistrations(prev => prev.map(r => 
          r._id === registrationId 
            ? { ...r, paymentProofStatus: approved ? 'approved' : 'rejected', status: approved ? 'confirmed' : 'rejected' }
            : r
        ));
      } else {
        alert(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setProcessing(null);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      // Show orders waiting for payment proof OR with pending proof
      return reg.paymentProofStatus === 'pending' || (!reg.paymentProof && reg.status === 'pending');
    }
    return reg.paymentProofStatus === filter;
  });

  const getStatusCounts = () => {
    const pending = registrations.filter(r => r.paymentProofStatus === 'pending' || (!r.paymentProof && r.status === 'pending')).length;
    const approved = registrations.filter(r => r.paymentProofStatus === 'approved').length;
    const rejected = registrations.filter(r => r.paymentProofStatus === 'rejected').length;
    return { pending, approved, rejected };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: '#fff'
      }}>
        <div>Loading payment submissions...</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      color: '#fff'
    }}>
      <div style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 190, 11, 0.2) 100%)',
        padding: '2rem',
        borderRadius: '20px',
        border: '2px solid rgba(255, 255, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #ffff00 0%, #ff00ff 50%, #00ffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Anton', sans-serif"
        }}>
          💳 Payment Approvals
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#ddd' }}>
          Review and approve payment proofs for merchandise and paid events
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '30px',
              border: filter === f ? '2px solid #ffff00' : '2px solid rgba(255, 255, 255, 0.2)',
              background: filter === f 
                ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.4) 0%, rgba(255, 190, 11, 0.4) 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontFamily: "'Anton', sans-serif",
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            {f === 'pending' && `⏳ Pending (${counts.pending})`}
            {f === 'approved' && `✅ Approved (${counts.approved})`}
            {f === 'rejected' && `❌ Rejected (${counts.rejected})`}
            {f === 'all' && `📋 All (${registrations.length})`}
          </button>
        ))}
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#999' }}>
            No {filter !== 'all' ? filter : ''} payment submissions
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1.5rem'
        }}>
          {filteredRegistrations.map(reg => (
            <div
              key={reg._id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '2rem',
                alignItems: 'start'
              }}>
                {/* Left: Details */}
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#ffff00'
                  }}>
                    {reg.event?.eventName}
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ color: '#999', fontSize: '0.9rem' }}>Participant</div>
                      <div style={{ fontWeight: '600' }}>
                        {reg.participant?.firstName} {reg.participant?.lastName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#bbb' }}>
                        {reg.participant?.email}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#999', fontSize: '0.9rem' }}>Event Type</div>
                      <div style={{ fontWeight: '600' }}>{reg.event?.eventType}</div>
                    </div>

                    <div>
                      <div style={{ color: '#999', fontSize: '0.9rem' }}>Amount</div>
                      <div style={{ fontWeight: '600', color: '#00ff88' }}>
                        ₹{reg.event?.registrationFee || 0}
                      </div>
                    </div>

                    {reg.merchandiseDetails && (
                      <div>
                        <div style={{ color: '#999', fontSize: '0.9rem' }}>Quantity</div>
                        <div style={{ fontWeight: '600' }}>
                          {reg.merchandiseDetails.quantity || 1}
                        </div>
                      </div>
                    )}

                    {reg.merchandiseDetails?.selectedVariants && Object.keys(reg.merchandiseDetails.selectedVariants).length > 0 && (
                      <div>
                        <div style={{ color: '#999', fontSize: '0.9rem' }}>Variants</div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                          {Object.entries(reg.merchandiseDetails.selectedVariants).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ color: '#999', fontSize: '0.9rem' }}>Status</div>
                      <div style={{ 
                        fontWeight: '600',
                        color: reg.paymentProofStatus === 'pending' ? '#ffff00' : 
                               reg.paymentProofStatus === 'approved' ? '#00ff88' : 
                               !reg.paymentProof && reg.status === 'pending' ? '#ff8800' : '#ff0055'
                      }}>
                        {!reg.paymentProof && reg.status === 'pending' 
                          ? 'AWAITING PAYMENT' 
                          : (reg.paymentProofStatus?.toUpperCase() || 'PENDING')}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#999', fontSize: '0.9rem' }}>Order Date</div>
                      <div style={{ fontSize: '0.9rem' }}>
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </div>
                    </div>

                    {reg.paymentProofUploadedAt && (
                      <div>
                        <div style={{ color: '#999', fontSize: '0.9rem' }}>Proof Uploaded</div>
                        <div style={{ fontSize: '0.9rem' }}>
                          {new Date(reg.paymentProofUploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for pending */}
                  {reg.paymentProofStatus === 'pending' && reg.paymentProof && (
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '1rem'
                    }}>
                      <button
                        onClick={() => handleApproval(reg._id, true)}
                        disabled={processing === reg._id}
                        style={{
                          padding: '0.8rem 1.5rem',
                          borderRadius: '30px',
                          border: '2px solid rgba(0, 255, 136, 0.6)',
                          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 200, 100, 0.3) 100%)',
                          color: '#fff',
                          cursor: processing === reg._id ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          fontFamily: "'Anton', sans-serif",
                          textTransform: 'uppercase',
                          transition: 'all 0.3s ease',
                          opacity: processing === reg._id ? 0.5 : 1
                        }}
                      >
                        {processing === reg._id ? '⏳ Processing...' : '✅ Approve'}
                      </button>

                      <button
                        onClick={() => handleApproval(reg._id, false)}
                        disabled={processing === reg._id}
                        style={{
                          padding: '0.8rem 1.5rem',
                          borderRadius: '30px',
                          border: '2px solid rgba(255, 0, 85, 0.6)',
                          background: 'linear-gradient(135deg, rgba(255, 0, 85, 0.3) 0%, rgba(200, 0, 60, 0.3) 100%)',
                          color: '#fff',
                          cursor: processing === reg._id ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          fontFamily: "'Anton', sans-serif",
                          textTransform: 'uppercase',
                          transition: 'all 0.3s ease',
                          opacity: processing === reg._id ? 0.5 : 1
                        }}
                      >
                        {processing === reg._id ? '⏳ Processing...' : '❌ Reject'}
                      </button>
                    </div>
                  )}

                  {reg.paymentApprovedAt && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.8rem',
                      background: 'rgba(0, 255, 136, 0.1)',
                      borderRadius: '10px',
                      fontSize: '0.9rem'
                    }}>
                      Processed on {new Date(reg.paymentApprovedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Right: Payment Proof Image */}
                <div>
                  {reg.paymentProof && (
                    <div>
                      <div style={{ 
                        color: '#999', 
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        Payment Proof
                      </div>
                      <img
                        src={reg.paymentProof}
                        alt="Payment Proof"
                        onClick={() => setSelectedImage(reg.paymentProof)}
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '15px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#00ffff',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedImage(reg.paymentProof)}
                      >
                        🔍 Click to enlarge
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
          <img
            src={selectedImage}
            alt="Payment Proof Enlarged"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '20px',
              border: '3px solid #ffff00'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentApprovals;
