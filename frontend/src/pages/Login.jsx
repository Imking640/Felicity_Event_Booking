import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      navigate('/dashboard');
    } else {
      setError(result.message);
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
      {/* Animated Background Circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s',
        zIndex: 0
      }} />

      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.15) 0%, rgba(131, 56, 236, 0.15) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '3rem',
        borderRadius: '30px',
        boxShadow: '0 0 40px rgba(255, 0, 110, 0.4), 0 8px 32px rgba(131, 56, 236, 0.3)',
        border: '2px solid rgba(255, 0, 110, 0.3)',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎭</div>
          <h2 style={{ 
            color: '#ffff00', 
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            textShadow: '0 0 20px rgba(255, 255, 0, 0.8)'
          }}>
            Welcome Back!
          </h2>
          <p style={{ 
            color: '#00ffff', 
            fontSize: '1rem',
            fontWeight: '600',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
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
              transition: 'all 0.3s ease',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
