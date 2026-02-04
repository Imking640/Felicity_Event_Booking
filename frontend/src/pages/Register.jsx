import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    participantType: 'IIIT',
    college: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showDiscoToast('⚠️ Passwords do not match!', false);
      return;
    }

    if (formData.password.length < 6) {
      showDiscoToast('⚠️ Password must be at least 6 characters', false);
      return;
    }

    // Validate IIIT email
    if (formData.participantType === 'IIIT') {
      if (!formData.email.endsWith('@iiit.ac.in') && !formData.email.endsWith('@students.iiit.ac.in')) {
        showDiscoToast('⚠️ IIIT participants must use IIIT email address', false);
        return;
      }
    }

    // Validate college for Non-IIIT
    if (formData.participantType === 'Non-IIIT' && !formData.college) {
      showDiscoToast('⚠️ Please enter your college name', false);
      return;
    }

    setLoading(true);

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      participantType: formData.participantType,
      college: formData.participantType === 'Non-IIIT' ? formData.college : 'IIIT Hyderabad',
      contactNumber: formData.contactNumber
    });
    
    if (result.success) {
      createConfetti();
      showDiscoToast('🎉 Registration successful! Let\'s personalize your feed!', true);
      setTimeout(() => navigate('/onboarding'), 600);
    } else {
      showDiscoToast('⚠️ ' + result.message, false);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Space-only decorations */}
      <DiscoDecorations />

      <div className="disco-card" style={{ padding: '2rem', maxWidth: '980px', width: '100%', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="logo-disco" style={{ margin: '0 auto 2rem' }} />
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            fontFamily: "'Bungee', cursive",
            color: '#ff00ff',
            textShadow: '0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)',
            letterSpacing: '2px'
          }}>
            JOIN THE PARTY!
          </h2>
          <p style={{ 
            color: '#00ffff', 
            fontSize: '0.9rem', 
            fontFamily: "'Anton', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
          }}>
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Left column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="disco-label">👤 FIRST NAME</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="disco-input"
                style={{ width: '100%', marginTop: '0.5rem' }}
                placeholder="John"
              />
            </div>

            <div>
              <label className="disco-label">👤 LAST NAME</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="disco-input"
                style={{ width: '100%', marginTop: '0.5rem' }}
                placeholder="Doe"
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label className="disco-label">📧 EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="disco-input"
              style={{ width: '100%', marginTop: '0.5rem' }}
              placeholder="your@email.com"
            />
            {formData.participantType === 'IIIT' && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#ffff00', 
                marginTop: '0.3rem',
                fontFamily: "'Anton', sans-serif"
              }}>
                * Use your IIIT email (@iiit.ac.in)
              </p>
            )}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label className="disco-label">🎓 PARTICIPANT TYPE</label>
            <select
              name="participantType"
              value={formData.participantType}
              onChange={handleChange}
              required
              className="disco-input"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <option value="IIIT">IIIT Student</option>
              <option value="Non-IIIT">Non-IIIT Student</option>
            </select>
          </div>

          {formData.participantType === 'Non-IIIT' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label className="disco-label">🏫 COLLEGE NAME</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
                className="disco-input"
                style={{ width: '100%', marginTop: '0.5rem' }}
                placeholder="Your College Name"
              />
            </div>
          )}

          {/* Right column */}
          <div>
            <label className="disco-label">📱 CONTACT NUMBER</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="disco-input"
              style={{ width: '100%', marginTop: '0.5rem' }}
              placeholder="1234567890"
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label className="disco-label">🔒 PASSWORD</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="disco-input"
                style={{ width: '100%', marginTop: '0.5rem' }}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="disco-label">✅ CONFIRM</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="disco-input"
                style={{ width: '100%', marginTop: '0.5rem' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              className="disco-button"
              style={{ width: '100%' }}
            >
              {loading ? '⏳ CREATING ACCOUNT...' : '✨ JOIN THE FEST!'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(0, 255, 255, 0.3)' }}>
          <p style={{ color: '#fff', fontSize: '1rem', fontFamily: "'Anton', sans-serif" }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff006e', textDecoration: 'none', fontWeight: '700' }}>
              Login Here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
