import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';

const OrganizerProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [form, setForm] = useState({
    organizerName: '',
    category: '',
    description: '',
    contactEmail: '',
    contactNumber: '',
    discordWebhook: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        organizerName: user.organizerName || '',
        category: user.category || '',
        description: user.description || '',
        contactEmail: user.contactEmail || user.email || '',
        contactNumber: user.contactNumber || '',
        discordWebhook: user.discordWebhook || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', form);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Profile updated successfully!', true);
        
        // Update user in context
        updateUser(res.data.user);
        
        setEditing(false);
      }
    } catch (err) {
      console.error('Update profile error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to update profile', false);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!window.confirm('Request a password reset? Admin will be notified and will reset your password.')) return;
    
    setRequestingReset(true);
    try {
      const res = await api.post('/auth/request-password-reset', { 
        email: user?.email,
        reason: 'Requested from profile page'
      });
      if (res.data.success) {
        showDiscoToast('Password reset request submitted! Admin will process it shortly.', true);
      }
    } catch (err) {
      console.error('Request password reset error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to submit request', false);
    } finally {
      setRequestingReset(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div className="logo-disco" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            👤 Organizer Profile
          </h1>
          <p style={{ color: '#00ffff', fontSize: '1rem' }}>
            Manage your organizer information
          </p>
        </div>

        <div className="disco-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', margin: 0 }}>
              Profile Details
            </h2>
            {!editing && (
              <button className="disco-button" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,0,0.3)' }}>
                <div style={{ color: '#ffff00', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🏢 Organizer Name</div>
                <div style={{ fontSize: '1.1rem' }}>{user?.organizerName || 'Not set'}</div>
              </div>

              <div style={{ background: 'rgba(0,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,255,0.3)' }}>
                <div style={{ color: '#00ffff', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>📂 Category</div>
                <div style={{ fontSize: '1.1rem' }}>{user?.category || 'Not set'}</div>
              </div>

              <div style={{ background: 'rgba(255,0,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,255,0.3)' }}>
                <div style={{ color: '#ff00ff', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>📝 Description</div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>{user?.description || 'No description provided'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,0,110,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,110,0.3)' }}>
                  <div style={{ color: '#ff006e', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>📧 Contact Email</div>
                  <div style={{ fontSize: '0.95rem', wordBreak: 'break-all' }}>{user?.contactEmail || user?.email}</div>
                </div>

                <div style={{ background: 'rgba(0,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,0,0.3)' }}>
                  <div style={{ color: '#00ff00', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>📱 Contact Number</div>
                  <div style={{ fontSize: '1rem' }}>{user?.contactNumber || 'Not set'}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(138,43,226,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(138,43,226,0.3)' }}>
                <div style={{ color: '#8a2be2', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🔗 Discord Webhook</div>
                <div style={{ fontSize: '0.9rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {user?.discordWebhook || 'Not configured'}
                </div>
                {user?.discordWebhook && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#aaa' }}>
                    ✅ Auto-post new events to Discord
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)' }}>
                <div style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🔐 Login Email (Non-Editable)</div>
                <div style={{ fontSize: '1rem' }}>{user?.email}</div>
              </div>

              {/* Password Reset Request Section */}
              <div style={{ background: 'rgba(255,0,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,0,0.3)' }}>
                <div style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🔑 Password Reset</div>
                <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem' }}>
                  Forgot your password? Request a password reset and the admin will generate a new password for you.
                </div>
                <button 
                  type="button"
                  className="disco-button" 
                  onClick={handleRequestPasswordReset}
                  disabled={requestingReset}
                  style={{ 
                    background: 'linear-gradient(90deg, #ff4444, #ff6b6b)',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  {requestingReset ? '⏳ Requesting...' : '🔑 Request Password Reset'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="disco-label">🏢 Organizer Name</label>
                <input
                  name="organizerName"
                  value={form.organizerName}
                  onChange={handleChange}
                  className="disco-input"
                  required
                />
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
                  <option value="">Select Category</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="disco-label">📝 Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="disco-input"
                  rows={4}
                  placeholder="Brief description about your organization..."
                />
              </div>

              <div>
                <label className="disco-label">📧 Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className="disco-input"
                  required
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

              <div>
                <label className="disco-label">🔗 Discord Webhook URL (Optional)</label>
                <input
                  type="url"
                  name="discordWebhook"
                  value={form.discordWebhook}
                  onChange={handleChange}
                  className="disco-input"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>
                  New events will be automatically posted to this webhook
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="disco-button" disabled={loading} style={{ flex: 1 }}>
                  {loading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="disco-button" 
                  onClick={() => setEditing(false)}
                  style={{ flex: 1, background: 'linear-gradient(90deg,#555,#333)' }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
