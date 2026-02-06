import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const PasswordResetRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/password-reset-requests?status=${filter}`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Fetch password reset requests error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to load requests', false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset password for this organizer?')) return;
    
    setProcessingId(id);
    try {
      const res = await api.post(`/admin/password-reset-requests/${id}/reset`);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Password reset successfully!', true);
        setCreatedCredentials(res.data.credentials);
        fetchRequests();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to reset password', false);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCloseRequest = async (id) => {
    if (!window.confirm('Close this request without resetting password?')) return;
    
    setProcessingId(id);
    try {
      const res = await api.post(`/admin/password-reset-requests/${id}/close`);
      if (res.data.success) {
        showDiscoToast('Request closed', true);
        fetchRequests();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to close request', false);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showDiscoToast('Copied to clipboard!', true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#ffff00', color: '#000' },
      completed: { background: '#00ff00', color: '#000' },
      closed: { background: '#888', color: '#fff' }
    };
    return (
      <span style={{
        ...styles[status],
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', fontSize: '2rem', marginBottom: '0.5rem' }}>
                🔑 Password Reset Requests
              </h1>
              <p style={{ color: '#00ffff' }}>Manage organizer password reset requests</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="disco-button" onClick={() => navigate('/dashboard')}>
                📊 Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="disco-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['pending', 'completed', 'closed'].map(status => (
              <button
                key={status}
                className="disco-button"
                onClick={() => setFilter(status)}
                style={{
                  opacity: filter === status ? 1 : 0.6,
                  transform: filter === status ? 'scale(1.05)' : 'scale(1)',
                  background: filter === status 
                    ? 'linear-gradient(90deg, #ff006e, #ffbe0b)' 
                    : 'rgba(255,255,255,0.1)'
                }}
              >
                {status === 'pending' && '⏳'} 
                {status === 'completed' && '✅'} 
                {status === 'closed' && '❌'} 
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Created Credentials Display */}
        {createdCredentials && (
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem', border: '3px solid #00ff00', background: 'rgba(0,255,0,0.1)' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem', fontFamily: "'Bungee', cursive" }}>
              ✅ Password Reset Complete!
            </h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', fontFamily: 'monospace' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Email:</strong> {createdCredentials.email}
                <button 
                  onClick={() => copyToClipboard(createdCredentials.email)}
                  style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', background: '#00ffff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  📋 Copy
                </button>
              </div>
              <div>
                <strong>New Password:</strong> {createdCredentials.password}
                <button 
                  onClick={() => copyToClipboard(createdCredentials.password)}
                  style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', background: '#00ffff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ffff00' }}>
              ⚠️ Share these credentials securely with the organizer. The password will not be shown again.
            </p>
            <button 
              className="disco-button" 
              onClick={() => setCreatedCredentials(null)}
              style={{ marginTop: '1rem' }}
            >
              ✅ Got it
            </button>
          </div>
        )}

        {/* Requests List */}
        <div className="disco-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
            📋 {filter.charAt(0).toUpperCase() + filter.slice(1)} Requests ({requests.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              No {filter} password reset requests.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {requests.map(req => (
                <div key={req._id} className="event-card-disco">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#ffff00' }}>
                          {req.organizerName}
                        </h4>
                        {getStatusBadge(req.status)}
                      </div>
                      
                      <div style={{ color: '#00ffff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        📧 {req.email}
                      </div>
                      
                      {req.reason && (
                        <div style={{ color: '#ddd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          💬 Reason: {req.reason}
                        </div>
                      )}
                      
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
                        Requested: {new Date(req.createdAt).toLocaleString()}
                      </div>
                      
                      {req.completedAt && (
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          {req.status === 'completed' ? 'Completed' : 'Closed'}: {new Date(req.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                        <button 
                          className="disco-button" 
                          onClick={() => handleResetPassword(req._id)}
                          disabled={processingId === req._id}
                          style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                        >
                          {processingId === req._id ? '⏳ Processing...' : '🔑 Reset Password'}
                        </button>
                        
                        <button 
                          className="disco-button" 
                          onClick={() => handleCloseRequest(req._id)}
                          disabled={processingId === req._id}
                          style={{ 
                            fontSize: '0.85rem', 
                            padding: '0.5rem 0.75rem', 
                            background: 'linear-gradient(90deg,#888,#666)' 
                          }}
                        >
                          ❌ Close Request
                        </button>
                      </div>
                    )}

                    {req.status === 'completed' && (
                      <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(0,255,0,0.1)', 
                        borderRadius: '8px',
                        border: '2px solid rgba(0,255,0,0.3)',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#00ff00', fontSize: '1.5rem' }}>✅</div>
                        <div style={{ color: '#00ff00', fontSize: '0.85rem' }}>Password Reset</div>
                      </div>
                    )}

                    {req.status === 'closed' && (
                      <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(128,128,128,0.1)', 
                        borderRadius: '8px',
                        border: '2px solid rgba(128,128,128,0.3)',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: '#888', fontSize: '1.5rem' }}>❌</div>
                        <div style={{ color: '#888', fontSize: '0.85rem' }}>Closed</div>
                      </div>
                    )}
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

export default PasswordResetRequests;
