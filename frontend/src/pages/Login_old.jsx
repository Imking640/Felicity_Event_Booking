import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      showDiscoToast('🎉 Welcome back! Let\'s boogie!', true);
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      setError(result.message);
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
      position: 'relative'
    }}>
      {/* Disco Decorations */}
      <DiscoDecorations />

      <div className="disco-card" style={{
        padding: '3rem',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-disco" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="reactive-title" style={{ 
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>
            Welcome Back!
          </h2>
          <p className="glow-text" style={{ 
            color: '#00ffff', 
            fontSize: '1rem',
            fontFamily: "'Bungee', cursive"
          }}>
            Login to continue your journey
          </p>
        </div>
        
        {error && (
          <div style={{
            background: 'rgba(255, 59, 48, 0.3)',
            backdropFilter: 'blur(10px)',
            color: '#ffff00',
            padding: '1rem',
            borderRadius: '15px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            border: '2px solid rgba(255, 59, 48, 0.5)',
            fontWeight: '600',
            textShadow: '0 0 10px rgba(255, 255, 0, 0.8)'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.7rem', 
              color: '#ffff00', 
              fontWeight: '600',
              fontSize: '0.95rem',
              textShadow: '0 0 10px rgba(255, 255, 0, 0.6)'
            }}>
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '15px',
                fontSize: '1rem',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              placeholder="your.email@example.com"
              onFocus={(e) => e.target.style.border = '2px solid rgba(0, 255, 255, 0.8)'}
              onBlur={(e) => e.target.style.border = '2px solid rgba(0, 255, 255, 0.3)'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.7rem', 
              color: '#ffff00', 
              fontWeight: '600',
              fontSize: '0.95rem',
              textShadow: '0 0 10px rgba(255, 255, 0, 0.6)'
            }}>
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '15px',
                fontSize: '1rem',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              placeholder="••••••••"
              onFocus={(e) => e.target.style.border = '2px solid rgba(0, 255, 255, 0.8)'}
              onBlur={(e) => e.target.style.border = '2px solid rgba(0, 255, 255, 0.3)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? 'rgba(100, 100, 100, 0.5)' 
                : 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
              color: '#fff',
              padding: '1rem',
              border: '3px solid #00ffff',
              borderRadius: '15px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 30px rgba(255, 0, 110, 0.6)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 50px rgba(255, 0, 110, 1), 0 0 80px rgba(255, 190, 11, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 110, 0.6)';
              }
            }}
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1.5rem 0',
          borderTop: '2px solid rgba(0, 255, 255, 0.3)'
        }}>
          <p style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>
            New to Felicity?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#ff006e', 
                textDecoration: 'none', 
                fontWeight: '700',
                textShadow: '0 0 10px rgba(255, 0, 110, 0.8)'
              }}
            >
              Register Now →
            </Link>
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;
