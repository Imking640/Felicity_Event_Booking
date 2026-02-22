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
  const [adminComments, setAdminComments] = useState({});
  const [historyOrgId, setHistoryOrgId] = useState(null);
  const [resetHistory, setResetHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
      const res = await api.post(`/admin/password-reset-requests/${id}/reset`, {
        adminComment: adminComments[id] || ''
      });
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Password reset successfully!', true);
        setCreatedCredentials(res.data.credentials);
        setAdminComments(prev => { const n = {...prev}; delete n[id]; return n; });
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
      const res = await api.post(`/admin/password-reset-requests/${id}/close`, {
        adminComment: adminComments[id] || ''
      });
      if (res.data.success) {
        showDiscoToast('Request closed', true);
        setAdminComments(prev => { const n = {...prev}; delete n[id]; return n; });
        fetchRequests();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to close request', false);
    } finally {
      setProcessingId(null);
    }
  };

  const fetchResetHistory = async (orgId) => {
    if (historyOrgId === orgId) { setHistoryOrgId(null); return; }
    setHistoryOrgId(orgId);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/admin/organizers/${orgId}/reset-history`);
      if (res.data.success) setResetHistory(res.data.requests || []);
    } catch (err) {
      showDiscoToast('Failed to load history', false);
    } finally {
      setLoadingHistory(false);
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
                      
                      {req.adminComment && (
                        <div style={{ color: '#ffa500', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          🛡️ Admin: {req.adminComment}
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
                      
                      <button
                        onClick={() => fetchResetHistory(req.organizer?._id || req.organizer)}
                        style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #00ffff', color: '#00ffff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        {historyOrgId === (req.organizer?._id || req.organizer) ? '▲ Hide History' : '📜 Reset History'}
                      </button>
                    </div>

                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
                        <textarea
                          placeholder="Admin comment (optional)..."
                          value={adminComments[req._id] || ''}
                          onChange={e => setAdminComments(prev => ({ ...prev, [req._id]: e.target.value }))}
                          rows={2}
                          maxLength={500}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(0,255,255,0.3)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                            fontSize: '0.85rem',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                        />
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

                  {/* Reset History Panel */}
                  {historyOrgId === (req.organizer?._id || req.organizer) && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,255,255,0.2)' }}>
                      <h5 style={{ color: '#00ffff', marginBottom: '0.75rem', fontFamily: "'Bungee', cursive", fontSize: '0.95rem' }}>
                        📜 Password Reset History — {req.organizerName}
                      </h5>
                      {loadingHistory ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>Loading history...</div>
                      ) : resetHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>No previous reset requests found.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {resetHistory.map(h => (
                            <div key={h._id} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: `3px solid ${h.status === 'completed' ? '#00ff00' : h.status === 'closed' ? '#888' : '#ffff00'}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 'bold', color: h.status === 'completed' ? '#00ff00' : h.status === 'closed' ? '#888' : '#ffff00', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                  {h.status === 'completed' ? '✅' : h.status === 'closed' ? '❌' : '⏳'} {h.status}
                                </span>
                                <span style={{ color: '#888', fontSize: '0.75rem' }}>
                                  {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              {h.reason && <div style={{ color: '#ddd', fontSize: '0.8rem' }}>💬 {h.reason}</div>}
                              {h.adminComment && <div style={{ color: '#ffa500', fontSize: '0.8rem' }}>🛡️ Admin: {h.adminComment}</div>}
                              {h.completedAt && (
                                <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                  {h.status === 'completed' ? 'Completed' : 'Closed'}: {new Date(h.completedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
