import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState('request'); // 'request', 'verify', 'change'
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const loadOrganizers = async () => {
      try {
        const res = await api.get('/auth/organizers');
        setOrganizers(res.data.organizers || []);
      } catch (e) {}
    };
    if (user?.role === 'participant') {
      loadOrganizers();
    }
  }, [user]);

  const getFollowedOrganizerNames = () => {
    if (!user?.followedClubs || !organizers.length) return [];
    return organizers
      .filter(org => user.followedClubs.includes(org._id))
      .map(org => org.organizerName);
  };

  // Password change flow
  const requestPasswordOTP = async () => {
    setOtpSending(true);
    try {
      const res = await api.post('/auth/request-password-change');
      if (res.data.success) {
        showDiscoToast('📧 OTP sent to your email!', true);
        setPasswordStep('verify');
      }
    } catch (e) {
      showDiscoToast('⚠️ ' + (e.response?.data?.message || 'Failed to send OTP'), false);
    }
    setOtpSending(false);
  };

  const verifyPasswordOTP = async () => {
    if (!otp || otp.length !== 6) {
      showDiscoToast('⚠️ Please enter the 6-digit OTP', false);
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await api.post('/auth/verify-password-otp', { otp });
      if (res.data.success) {
        showDiscoToast('✅ OTP verified!', true);
        setPasswordStep('change');
      }
    } catch (e) {
      showDiscoToast('⚠️ ' + (e.response?.data?.message || 'Invalid OTP'), false);
    }
    setOtpVerifying(false);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showDiscoToast('⚠️ Password must be at least 6 characters', false);
      return;
    }
    if (newPassword !== confirmPassword) {
      showDiscoToast('⚠️ Passwords do not match', false);
      return;
    }
    setChanging(true);
    try {
      const res = await api.post('/auth/change-password-with-otp', { otp, newPassword });
      if (res.data.success) {
        showDiscoToast('✅ Password changed successfully!', true);
        setShowPasswordModal(false);
        resetPasswordFlow();
      }
    } catch (e) {
      showDiscoToast('⚠️ ' + (e.response?.data?.message || 'Failed to change password'), false);
    }
    setChanging(false);
  };

  const resetPasswordFlow = () => {
    setPasswordStep('request');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <DiscoDecorations />
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>My Profile</h1>
          {user?.role === 'participant' && (
            <button className="disco-button" onClick={() => navigate('/profile/edit')}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Basic Info Card */}
        <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>
            Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ color: '#00ffff', fontSize: '0.85rem' }}>First Name</label>
              <p style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{user.firstName || '-'}</p>
            </div>
            <div>
              <label style={{ color: '#00ffff', fontSize: '0.85rem' }}>Last Name</label>
              <p style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{user.lastName || '-'}</p>
            </div>
            <div>
              <label style={{ color: '#00ffff', fontSize: '0.85rem' }}>Email</label>
              <p style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{user.email || '-'}</p>
            </div>
            <div>
              <label style={{ color: '#00ffff', fontSize: '0.85rem' }}>Contact Number</label>
              <p style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{user.contactNumber || '-'}</p>
            </div>
            <div>
              <label style={{ color: '#00ffff', fontSize: '0.85rem' }}>College</label>
              <p style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{user.college || '-'}</p>
            </div>
            <div>
              <label style={{ color: '#00ffff', fontSize: '0.85rem' }}>Participant Type</label>
              <p style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{user.participantType || '-'}</p>
            </div>
          </div>
        </div>

        {/* Interests Card - Only for participants */}
        {user?.role === 'participant' && (
          <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>
              Areas of Interest
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {user.interests && user.interests.length > 0 ? (
                user.interests.map(interest => (
                  <span key={interest} style={{
                    background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {interest}
                  </span>
                ))
              ) : (
                <p style={{ color: '#888' }}>No interests selected</p>
              )}
            </div>
          </div>
        )}

        {/* Followed Organizers - Only for participants */}
        {user?.role === 'participant' && (
          <div className="disco-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>
              Following Clubs/Organizers
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {getFollowedOrganizerNames().length > 0 ? (
                getFollowedOrganizerNames().map(name => (
                  <span key={name} style={{
                    background: 'rgba(0, 255, 255, 0.2)',
                    border: '1px solid #00ffff',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
                    {name}
                  </span>
                ))
              ) : (
                <p style={{ color: '#888' }}>Not following any organizers</p>
              )}
            </div>
          </div>
        )}

        {/* Security Card */}
        <div className="disco-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>
            Security
          </h3>
          <button className="disco-button" onClick={() => setShowPasswordModal(true)}>
            🔐 Change Password
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="disco-card" style={{ padding: '2rem', maxWidth: 400, width: '90%' }}>
            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1.5rem' }}>
              Change Password
            </h2>

            {passwordStep === 'request' && (
              <>
                <p style={{ marginBottom: '1rem', color: '#ccc' }}>
                  For security, we'll send a verification code to your email: <strong>{user.email}</strong>
                </p>
                <button className="disco-button" onClick={requestPasswordOTP} disabled={otpSending} style={{ width: '100%' }}>
                  {otpSending ? 'Sending...' : '📧 Send Verification Code'}
                </button>
              </>
            )}

            {passwordStep === 'verify' && (
              <>
                <p style={{ marginBottom: '1rem', color: '#ccc' }}>
                  Enter the 6-digit code sent to your email:
                </p>
                <input
                  className="disco-input"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', marginBottom: '1rem' }}
                />
                <button className="disco-button" onClick={verifyPasswordOTP} disabled={otpVerifying} style={{ width: '100%' }}>
                  {otpVerifying ? 'Verifying...' : '✅ Verify OTP'}
                </button>
              </>
            )}

            {passwordStep === 'change' && (
              <>
                <p style={{ marginBottom: '1rem', color: '#ccc' }}>
                  OTP verified! Enter your new password:
                </p>
                <input
                  className="disco-input"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ marginBottom: '0.8rem' }}
                />
                <input
                  className="disco-input"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <button className="disco-button" onClick={changePassword} disabled={changing} style={{ width: '100%' }}>
                  {changing ? 'Changing...' : '🔐 Change Password'}
                </button>
              </>
            )}

            <button
              onClick={() => { setShowPasswordModal(false); resetPasswordFlow(); }}
              style={{
                marginTop: '1rem', width: '100%', padding: '0.8rem',
                background: 'transparent', border: '1px solid #666', color: '#fff',
                borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
