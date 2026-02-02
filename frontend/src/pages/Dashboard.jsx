import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DiscoDecorations from '../components/DiscoDecorations';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
      position: 'relative'
    }}>
      <DiscoDecorations />

      {/* Welcome Header */}
      <div className="disco-card" style={{
        padding: '3rem',
        marginBottom: '2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="logo-disco" style={{ margin: '0 auto 2rem' }} />
        
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontFamily: "'Bungee', cursive",
          marginBottom: '0.5rem',
          color: '#ffff00',
          textShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)',
          letterSpacing: '2px'
        }}>
          WELCOME BACK! 🎉
        </h1>
        <p className="glow-text" style={{ 
          color: '#00ffff', 
          fontSize: '1.2rem',
          fontFamily: "'Anton', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {user?.firstName || user?.organizerName}
        </p>
        <p style={{
          color: '#ff00ff',
          fontSize: '1rem',
          marginTop: '1rem',
          fontFamily: "'Anton', sans-serif"
        }}>
          Ready to make Felicity 2026 unforgettable?
        </p>
      </div>
      
      {/* Profile Card */}
      <div className="disco-card" style={{ 
        padding: '2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '2rem',
          color: '#ff00ff',
          fontFamily: "'Bungee', cursive",
          textShadow: '0 0 15px rgba(255, 0, 255, 0.6)',
          textAlign: 'center'
        }}>
          👤 YOUR PROFILE
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 0, 0.1)',
            padding: '1.5rem',
            borderRadius: '15px',
            border: '2px solid rgba(255, 255, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>📧</div>
            <p style={{
              color: '#ffff00',
              fontSize: '0.8rem',
              marginBottom: '0.5rem',
              fontFamily: "'Anton', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Email</p>
            <p style={{
              color: '#fff',
              fontSize: '1rem',
              fontFamily: "'Anton', sans-serif",
              wordBreak: 'break-all'
            }}>
              {user?.email}
            </p>
          </div>

          {user?.firstName && (
            <div style={{
              background: 'rgba(0, 255, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '2px solid rgba(0, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>👤</div>
              <p style={{
                color: '#00ffff',
                fontSize: '0.8rem',
                marginBottom: '0.5rem',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Full Name</p>
              <p style={{
                color: '#fff',
                fontSize: '1rem',
                fontFamily: "'Anton', sans-serif"
              }}>
                {user.firstName} {user.lastName}
              </p>
            </div>
          )}

          {user?.participantType && (
            <div style={{
              background: 'rgba(255, 0, 255, 0.1)',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '2px solid rgba(255, 0, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>🎓</div>
              <p style={{
                color: '#ff00ff',
                fontSize: '0.8rem',
                marginBottom: '0.5rem',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Type</p>
              <p style={{
                color: '#fff',
                fontSize: '1rem',
                fontFamily: "'Anton', sans-serif"
              }}>
                {user.participantType} Student
              </p>
            </div>
          )}

          {user?.contactNumber && (
            <div style={{
              background: 'rgba(255, 0, 110, 0.1)',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '2px solid rgba(255, 0, 110, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>📱</div>
              <p style={{
                color: '#ff006e',
                fontSize: '0.8rem',
                marginBottom: '0.5rem',
                fontFamily: "'Anton', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Contact</p>
              <p style={{
                color: '#fff',
                fontSize: '1rem',
                fontFamily: "'Anton', sans-serif"
              }}>
                {user.contactNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="feature-card-disco" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
          <h3 style={{
            color: '#ff00ff',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            fontFamily: "'Bungee', cursive",
            textShadow: '0 0 10px rgba(255, 0, 255, 0.6)'
          }}>
            Browse Events
          </h3>
          <p style={{
            color: '#fff',
            marginBottom: '1.5rem',
            fontFamily: "'Anton', sans-serif",
            lineHeight: '1.6'
          }}>
            Discover amazing workshops, competitions, and cultural events
          </p>
          <button
            onClick={() => navigate('/events')}
            className="disco-button"
            style={{ width: '100%' }}
          >
            🎪 EXPLORE NOW
          </button>
        </div>

        <div className="feature-card-disco" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
          <h3 style={{
            color: '#00ffff',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            fontFamily: "'Bungee', cursive",
            textShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
          }}>
            My Registrations
          </h3>
          <p style={{
            color: '#fff',
            marginBottom: '1.5rem',
            fontFamily: "'Anton', sans-serif",
            lineHeight: '1.6'
          }}>
            View all your registered events and QR tickets
          </p>
          <button
            className="disco-button"
            style={{ width: '100%' }}
          >
            📋 VIEW TICKETS
          </button>
        </div>

        <div className="feature-card-disco" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
          <h3 style={{
            color: '#ffff00',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            fontFamily: "'Bungee', cursive",
            textShadow: '0 0 10px rgba(255, 255, 0, 0.6)'
          }}>
            Edit Profile
          </h3>
          <p style={{
            color: '#fff',
            marginBottom: '1.5rem',
            fontFamily: "'Anton', sans-serif",
            lineHeight: '1.6'
          }}>
            Update your personal information and preferences
          </p>
          <button
            className="disco-button"
            style={{ width: '100%' }}
          >
            ✏️ UPDATE INFO
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="disco-card" style={{
        padding: '3rem',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '2rem',
          color: '#ffff00',
          fontFamily: "'Bungee', cursive",
          textShadow: '0 0 15px rgba(255, 255, 0, 0.6)',
          textAlign: 'center'
        }}>
          📊 YOUR STATS
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <h3 className="glow-text" style={{
              fontSize: '4rem',
              color: '#ff00ff',
              marginBottom: '0.5rem',
              fontFamily: "'Bungee', cursive"
            }}>
              0
            </h3>
            <p style={{
              color: '#fff',
              fontSize: '1.1rem',
              fontFamily: "'Anton', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Events Registered
            </p>
          </div>

          <div>
            <h3 className="glow-text" style={{
              fontSize: '4rem',
              color: '#00ffff',
              marginBottom: '0.5rem',
              fontFamily: "'Bungee', cursive"
            }}>
              0
            </h3>
            <p style={{
              color: '#fff',
              fontSize: '1.1rem',
              fontFamily: "'Anton', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Events Attended
            </p>
          </div>

          <div>
            <h3 className="glow-text" style={{
              fontSize: '4rem',
              color: '#ffff00',
              marginBottom: '0.5rem',
              fontFamily: "'Bungee', cursive"
            }}>
              ₹0
            </h3>
            <p style={{
              color: '#fff',
              fontSize: '1.1rem',
              fontFamily: "'Anton', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Total Spent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
