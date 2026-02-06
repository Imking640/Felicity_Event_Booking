import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';
import ReCAPTCHA from 'react-google-recaptcha';

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
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const recaptchaRef = useRef(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset email verification when email changes
    if (name === 'email') {
      setEmailVerified(false);
      setVerificationSent(false);
      setVerificationCode('');
    }
    
    // Reset email verification when participant type changes
    if (name === 'participantType') {
      setEmailVerified(false);
      setVerificationSent(false);
      setVerificationCode('');
    }
  };

  // Send verification email
  const sendVerificationCode = async () => {
    if (!formData.email) {
      showDiscoToast('⚠️ Please enter your email first', false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showDiscoToast('⚠️ Please enter a valid email address', false);
      return;
    }

    setVerifyingEmail(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (data.success) {
        if (data.skipVerification) {
          // Email verification not configured - skip it
          setEmailVerified(true);
          showDiscoToast('✅ Email verification skipped (dev mode)', true);
        } else {
          setVerificationSent(true);
          showDiscoToast('📧 Verification code sent to your email!', true);
        }
      } else {
        showDiscoToast('⚠️ ' + data.message, false);
      }
    } catch (error) {
      showDiscoToast('⚠️ Failed to send verification email', false);
    }

    setVerifyingEmail(false);
  };

  // Verify the code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showDiscoToast('⚠️ Please enter the 6-digit code', false);
      return;
    }

    setVerifyingEmail(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: verificationCode })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        setEmailVerified(true);
        showDiscoToast('✅ Email verified successfully!', true);
      } else {
        showDiscoToast('⚠️ ' + data.message, false);
      }
    } catch (error) {
      showDiscoToast('⚠️ Failed to verify code', false);
    }

    setVerifyingEmail(false);
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

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      showDiscoToast('⚠️ Password must contain uppercase, lowercase, and number', false);
      return;
    }

    // Validate IIIT email - MUST end with .iiit.ac.in
    if (formData.participantType === 'IIIT') {
      if (!formData.email.endsWith('.iiit.ac.in')) {
        showDiscoToast('⚠️ IIIT email must end with .iiit.ac.in (e.g., @students.iiit.ac.in)', false);
        return;
      }
    }

    // Validate email format for Non-IIIT
    if (formData.participantType === 'Non-IIIT') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showDiscoToast('⚠️ Please enter a valid email address', false);
        return;
      }
      
      // Check if email is verified for Non-IIIT users
      if (!emailVerified) {
        showDiscoToast('⚠️ Please verify your email first', false);
        return;
      }
    }

    // Validate college for Non-IIIT
    if (formData.participantType === 'Non-IIIT' && !formData.college) {
      showDiscoToast('⚠️ Please enter your college name', false);
      return;
    }

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();
    
    if (!recaptchaToken) {
      showDiscoToast('⚠️ Please complete the CAPTCHA verification', false);
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
      contactNumber: formData.contactNumber,
      recaptchaToken,
      emailVerified
    });
    
    if (result.success) {
      createConfetti();
      showDiscoToast('🎉 Registration successful! Let\'s personalize your feed!', true);
      setTimeout(() => navigate('/onboarding'), 600);
    } else {
      showDiscoToast('⚠️ ' + result.message, false);
      // Reset reCAPTCHA on failed attempt
      recaptchaRef.current?.reset();
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
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="disco-input"
                style={{ flex: 1, marginTop: '0.5rem' }}
                placeholder="your@email.com"
                disabled={emailVerified}
              />
              {formData.participantType === 'Non-IIIT' && !emailVerified && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={verifyingEmail || !formData.email}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.8rem 1rem',
                    background: verificationSent 
                      ? 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)'
                      : 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
                    border: '2px solid rgba(255, 255, 0, 0.6)',
                    borderRadius: '15px',
                    color: '#000',
                    fontWeight: '700',
                    cursor: verifyingEmail ? 'not-allowed' : 'pointer',
                    fontFamily: "'Anton', sans-serif",
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    opacity: verifyingEmail ? 0.7 : 1
                  }}
                >
                  {verifyingEmail ? '⏳' : verificationSent ? '📧 Resend' : '📧 Verify'}
                </button>
              )}
              {emailVerified && (
                <span style={{ 
                  marginTop: '0.8rem', 
                  color: '#00ff88', 
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  ✅
                </span>
              )}
            </div>
            {formData.participantType === 'IIIT' && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#ffff00', 
                marginTop: '0.3rem',
                fontFamily: "'Anton', sans-serif"
              }}>
                * Use your IIIT email (ending with .iiit.ac.in)
              </p>
            )}
            {formData.participantType === 'Non-IIIT' && !emailVerified && verificationSent && (
              <div style={{ marginTop: '0.8rem' }}>
                <label className="disco-label" style={{ fontSize: '0.8rem' }}>🔐 ENTER 6-DIGIT CODE</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="disco-input"
                    style={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      letterSpacing: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={verifyingEmail || verificationCode.length !== 6}
                    style={{
                      padding: '0.8rem 1.2rem',
                      background: 'linear-gradient(135deg, #00ffff 0%, #00cccc 100%)',
                      border: '2px solid rgba(0, 255, 255, 0.6)',
                      borderRadius: '15px',
                      color: '#000',
                      fontWeight: '700',
                      cursor: verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                      fontFamily: "'Anton', sans-serif",
                      fontSize: '0.9rem',
                      opacity: verificationCode.length !== 6 ? 0.5 : 1
                    }}
                  >
                    {verifyingEmail ? '⏳' : '✓ VERIFY'}
                  </button>
                </div>
                <p style={{ 
                  fontSize: '0.7rem', 
                  color: '#00ffff', 
                  marginTop: '0.3rem',
                  fontFamily: "'Anton', sans-serif"
                }}>
                  📧 Check your email inbox (and spam folder)
                </p>
              </div>
            )}
            {formData.participantType === 'Non-IIIT' && emailVerified && (
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#00ff88', 
                marginTop: '0.3rem',
                fontFamily: "'Anton', sans-serif"
              }}>
                ✅ Email verified successfully!
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

          {/* reCAPTCHA */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              theme="dark"
            />
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
