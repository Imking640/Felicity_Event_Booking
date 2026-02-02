import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      showDiscoToast('🎉 Welcome back! Let\'s boogie!', true);
      setTimeout(() => navigate('/dashboard'), 500);
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
      {/* Disco Decorations */}
      <DiscoDecorations />

      {/* Additional floating elements for empty space */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        fontSize: '4rem',
        animation: 'float-disco 4s ease-in-out infinite',
        opacity: 0.7,
        zIndex: 5
      }}>🎭</div>

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        fontSize: '3.5rem',
        animation: 'float-disco 5s ease-in-out infinite',
        animationDelay: '1s',
        opacity: 0.7,
        zIndex: 5
      }}>🎪</div>

      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '12%',
        fontSize: '3rem',
        animation: 'float-disco 4.5s ease-in-out infinite',
        animationDelay: '2s',
        opacity: 0.7,
        zIndex: 5
      }}>✨</div>

      <div style={{
        position: 'absolute',
        top: '25%',
        right: '15%',
        fontSize: '2.5rem',
        animation: 'spin-vinyl 8s linear infinite',
        opacity: 0.6,
        zIndex: 5
      }}>💿</div>

      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '8%',
        fontSize: '3rem',
        animation: 'pulse-star 3s ease-in-out infinite',
        opacity: 0.7,
        zIndex: 5
      }}>🎵</div>

      <div className="disco-card" style={{ padding: '3rem', maxWidth: '450px', width: '100%', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="logo-disco" style={{ margin: '0 auto 2rem' }} />
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            fontFamily: "'Bungee', cursive",
            color: '#ffff00',
            textShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)',
            letterSpacing: '2px'
          }}>
            WELCOME BACK!
          </h2>
          <p style={{ 
            color: '#00ffff', 
            fontSize: '0.9rem', 
            fontFamily: "'Anton', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
          }}>
            Login to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="disco-label">📧 EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="disco-input"
              style={{ width: '100%', marginTop: '0.5rem' }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="disco-label">🔒 PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="disco-input"
              style={{ width: '100%', marginTop: '0.5rem' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="disco-button"
            style={{ width: '100%' }}
          >
            {loading ? '⏳ LOGGING IN...' : '🚀 LET\'S BOOGIE!'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid rgba(0, 255, 255, 0.3)' }}>
          <p style={{ color: '#fff', fontSize: '1rem', fontFamily: "'Anton', sans-serif" }}>
            New to Felicity?{' '}
            <Link to="/register" style={{ color: '#ff006e', textDecoration: 'none', fontWeight: '700' }}>
              Register Now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
