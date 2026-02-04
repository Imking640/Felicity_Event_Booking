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
    color: isActive(path) ? '#ffff00' : '#fff',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    fontFamily: "'Anton', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0.6rem 1.2rem',
    borderRadius: '30px',
    transition: 'all 0.3s ease',
    background: isActive(path) 
      ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.4) 0%, rgba(255, 190, 11, 0.4) 100%)'
      : 'rgba(255, 255, 255, 0.05)',
    border: isActive(path) 
      ? '2px solid rgba(255, 255, 0, 0.6)' 
      : '2px solid rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    boxShadow: isActive(path) 
      ? '0 0 15px rgba(255, 255, 0, 0.4)' 
      : 'none',
  });

  return (
    <nav
      style={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '1.5rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '2px solid rgba(255, 255, 0, 0.2)',
      }}
    >
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.8rem', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          <div style={{ transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Link to="/events" style={navLinkStyle('/events')}>
              🎉 Events
            </Link>
          </div>
          <div style={{ transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Link to="/organizers" style={navLinkStyle('/organizers')}>
              🏛️ Clubs
            </Link>
          </div>
          
          {isAuthenticated ? (
            <>
              <div style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                  📊 Dashboard
                </Link>
              </div>
              
              {user?.role === 'organizer' && (
                <>
                  <div style={{ transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Link to="/create-event" style={navLinkStyle('/create-event')}>
                      ➕ Create
                    </Link>
                  </div>
                  <div style={{ transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Link to="/organizer/profile" style={navLinkStyle('/organizer/profile')}>
                      👤 Profile
                    </Link>
                  </div>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <div style={{ transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Link to="/admin/manage-organizers" style={navLinkStyle('/admin/manage-organizers')}>
                      👥 Organizers
                    </Link>
                  </div>
                </>
              )}

              {user?.role === 'participant' && (
                <div style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Link to="/tickets" style={navLinkStyle('/tickets')}>
                    🎫 Tickets
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          transition: 'transform 0.3s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Link to="/" style={{ 
            color: '#ffff00', 
            textDecoration: 'none', 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
            fontWeight: '900',
            fontFamily: "'Bungee', cursive",
            textShadow: '0 0 30px rgba(255, 255, 0, 1), 0 0 60px rgba(255, 0, 255, 0.8), 0 0 90px rgba(0, 255, 255, 0.6)',
            letterSpacing: '4px',
            background: 'linear-gradient(90deg, #ffff00 0%, #ff00ff 50%, #00ffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 0, 0.8))',
            whiteSpace: 'nowrap'
          }}>
            ⚡ FELICITY ⚡
          </Link>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.8rem', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          {isAuthenticated ? (
            <>
              <div style={{
                padding: '0.6rem 1.2rem',
                background: 'rgba(0, 255, 255, 0.15)',
                border: '2px solid rgba(0, 255, 255, 0.4)',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                fontFamily: "'Anton', sans-serif",
                letterSpacing: '0.5px'
              }}>
                👋 {user?.firstName || user?.organizerName}
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.3) 0%, rgba(255, 190, 11, 0.3) 100%)',
                  color: '#fff',
                  border: '2px solid rgba(255, 0, 110, 0.6)',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(255, 0, 110, 0.4)',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Anton', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 0 30px rgba(255, 0, 110, 0.6)';
                  e.target.style.borderColor = 'rgba(255, 0, 110, 1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 0, 110, 0.4)';
                  e.target.style.borderColor = 'rgba(255, 0, 110, 0.6)';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Link 
                  to="/login" 
                  style={{
                    ...navLinkStyle('/login'),
                    border: '2px solid rgba(0, 255, 255, 0.5)',
                    color: '#00ffff',
                    background: 'rgba(0, 255, 255, 0.1)'
                  }}
                >
                  🔐 Login
                </Link>
              </div>
              <div style={{ transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Link 
                  to="/register"
                  style={{
                    ...navLinkStyle('/register'),
                    background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.4) 0%, rgba(255, 190, 11, 0.4) 100%)',
                    border: '2px solid rgba(255, 255, 0, 0.6)',
                    color: '#ffff00',
                    boxShadow: '0 0 20px rgba(255, 0, 110, 0.4)',
                    fontWeight: '700'
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
