import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: '#ffff00',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    background: isActive(path) ? 'rgba(255, 255, 0, 0.3)' : 'transparent',
    border: isActive(path) ? '2px solid #ffff00' : '2px solid transparent',
    textShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
  });

  return (
    <nav
      style={{
        background: 'linear-gradient(90deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
        color: 'white',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 8px 32px 0 rgba(255, 0, 110, 0.5)',
        borderBottom: '3px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ transition: 'transform 0.3s ease' }}>
          <Link to="/" style={{ 
            color: '#ffff00', 
            textDecoration: 'none', 
            fontSize: '1.75rem', 
            fontWeight: '900',
            textShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 0, 255, 0.6)',
            letterSpacing: '2px'
          }}>
            ⚡ FELICITY ⚡
          </Link>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ transition: 'transform 0.3s ease' }}>
            <Link to="/events" style={navLinkStyle('/events')}>
              🎉 Events
            </Link>
          </div>
          
          {isAuthenticated ? (
            <>
              <div style={{ transition: 'transform 0.3s ease' }}>
                <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                  📊 Dashboard
                </Link>
              </div>
              
              {user?.role === 'organizer' && (
                <div style={{ transition: 'transform 0.3s ease' }}>
                  <Link to="/create-event" style={navLinkStyle('/create-event')}>
                    ➕ Create Event
                  </Link>
                </div>
              )}
              
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 0, 0.3)',
                border: '2px solid #00ffff',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
              }}>
                👋 {user?.firstName || user?.organizerName}
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
                  color: '#fff',
                  border: '3px solid #ffff00',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  boxShadow: '0 0 20px rgba(255, 0, 110, 0.6), 0 0 40px rgba(255, 190, 11, 0.4)',
                  transition: 'all 0.3s ease',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div style={{ transition: 'transform 0.3s ease' }}>
                <Link 
                  to="/login" 
                  style={{
                    ...navLinkStyle('/login'),
                    border: '2px solid #00ffff',
                    color: '#00ffff',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
                  }}
                >
                  🔐 Login
                </Link>
              </div>
              <div style={{ transition: 'transform 0.3s ease' }}>
                <Link 
                  to="/register"
                  style={{
                    ...navLinkStyle('/register'),
                    background: 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
                    border: '2px solid #ffff00',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(255, 0, 110, 0.6), 0 0 40px rgba(255, 190, 11, 0.4)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  ✨ Register Now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
