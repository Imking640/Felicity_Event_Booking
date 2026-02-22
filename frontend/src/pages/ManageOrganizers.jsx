import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const ManageOrganizers = () => {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [form, setForm] = useState({
    organizerName: '',
    category: 'Technical',
    description: '',
    contactEmail: '',
    contactNumber: ''
  });

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizers');
      if (res.data.success) {
        setOrganizers(res.data.organizers || []);
      }
    } catch (err) {
      console.error('Fetch organizers error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to load organizers', false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await api.post('/admin/organizers', form);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Organizer created successfully!', true);
        setCreatedCredentials(res.data.credentials);
        setShowCreateForm(false);
        setForm({
          organizerName: '',
          category: 'Technical',
          description: '',
          contactEmail: '',
          contactNumber: ''
        });
        fetchOrganizers();
      }
    } catch (err) {
      console.error('Create organizer error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to create organizer', false);
    } finally {
      setCreating(false);
    }
  };

  const handleDisable = async (id) => {
    if (!window.confirm('Disable this organizer? They will not be able to login.')) return;
    
    try {
      const res = await api.delete(`/admin/organizers/${id}?action=disable`);
      if (res.data.success) {
        showDiscoToast('Organizer disabled', true);
        fetchOrganizers();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to disable organizer', false);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.put(`/admin/organizers/${id}/restore`);
      if (res.data.success) {
        showDiscoToast('Organizer restored', true);
        fetchOrganizers();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to restore organizer', false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('PERMANENTLY delete this organizer? This cannot be undone!')) return;
    
    try {
      const res = await api.delete(`/admin/organizers/${id}?action=delete`);
      if (res.data.success) {
        showDiscoToast('Organizer deleted permanently', true);
        fetchOrganizers();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to delete organizer', false);
    }
  };

  const handleResetPassword = async (id, email) => {
    if (!window.confirm(`Reset password for ${email}?`)) return;
    
    try {
      const res = await api.post(`/admin/organizers/${id}/reset-password`);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Password reset successfully!', true);
        setCreatedCredentials(res.data.credentials);
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Failed to reset password', false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showDiscoToast('Copied to clipboard!', true);
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', fontSize: '2rem', marginBottom: '0.5rem' }}>
                👥 Manage Organizers
              </h1>
              <p style={{ color: '#00ffff' }}>Create and manage organizer accounts</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="disco-button" onClick={() => navigate('/admin/dashboard')}>
                📊 Dashboard
              </button>
              <button className="disco-button" onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? '❌ Cancel' : '➕ Add New Organizer'}
              </button>
            </div>
          </div>
        </div>

        {/* Created Credentials Display */}
        {createdCredentials && (
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem', border: '3px solid #00ff00', background: 'rgba(0,255,0,0.1)' }}>
            <h3 style={{ color: '#00ff00', marginBottom: '1rem', fontFamily: "'Bungee', cursive" }}>
              ✅ Organizer Credentials Created!
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
                <strong>Password:</strong> {createdCredentials.password}
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

        {/* Create Form */}
        {showCreateForm && (
          <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff00ff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
              ➕ Create New Organizer
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <p style={{ color: '#00ffff', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                📧 Email &amp; password will be auto-generated and shown after creation.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="disco-label">🏢 Organizer Name</label>
                  <input
                    name="organizerName"
                    value={form.organizerName}
                    onChange={handleChange}
                    className="disco-input"
                    required
                    placeholder="Tech Club IIIT"
                  />
                </div>
              </div>

              <div>
                <label className="disco-label">📂 Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="disco-input"
                  required
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="disco-label">📝 Description (Optional)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="disco-input"
                  rows={3}
                  placeholder="Brief description about the organization..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="disco-label">📧 Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="disco-input"
                    placeholder="Leave empty to use login email"
                  />
                </div>

                <div>
                  <label className="disco-label">📱 Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    className="disco-input"
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,0,0.1)', borderRadius: '8px', border: '2px solid rgba(255,255,0,0.3)' }}>
                <strong style={{ color: '#ffff00' }}>ℹ️ Note:</strong> A random password will be auto-generated. You will receive the credentials after creation.
              </div>

              <button type="submit" className="disco-button" disabled={creating} style={{ marginTop: '0.5rem' }}>
                {creating ? '⏳ Creating...' : '✨ Create Organizer'}
              </button>
            </form>
          </div>
        )}

        {/* Organizers List */}
        <div className="disco-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: '#00ffff', marginBottom: '1.5rem', fontFamily: "'Bungee', cursive" }}>
            📋 All Organizers ({organizers.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading organizers...</div>
          ) : organizers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              No organizers yet. Create your first organizer account.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {organizers.map(org => (
                <div key={org._id} className="event-card-disco" style={{ opacity: org.isActive ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#ffff00' }}>
                          {org.organizerName}
                        </h4>
                        {!org.isActive && (
                          <span style={{ background: '#ff0000', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', color: '#fff' }}>
                            DISABLED
                          </span>
                        )}
                      </div>
                      
                      <div style={{ color: '#00ffff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        📂 {org.category}
                      </div>
                      
                      <div style={{ color: '#ddd', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        📧 {org.email}
                      </div>
                      
                      {org.description && (
                        <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          {org.description}
                        </div>
                      )}
                      
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
                        Created: {new Date(org.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                      <button 
                        className="disco-button" 
                        onClick={() => handleResetPassword(org._id, org.email)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                      >
                        🔑 Reset Password
                      </button>
                      
                      {org.isActive ? (
                        <button 
                          className="disco-button" 
                          onClick={() => handleDisable(org._id)}
                          style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'linear-gradient(90deg,#ff6b00,#ff8fab)' }}
                        >
                          🚫 Disable
                        </button>
                      ) : (
                        <button 
                          className="disco-button" 
                          onClick={() => handleRestore(org._id)}
                          style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'linear-gradient(90deg,#00ff00,#00ff88)' }}
                        >
                          ✅ Restore
                        </button>
                      )}
                      
                      <button 
                        className="disco-button" 
                        onClick={() => handleDelete(org._id)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'linear-gradient(90deg,#ff0000,#ff4444)' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
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

export default ManageOrganizers;
