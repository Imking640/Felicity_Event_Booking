import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DiscoDecorations from '../components/DiscoDecorations';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)',
      padding: '0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Disco Decorations */}
      <DiscoDecorations />
      
      {/* Hero Section with Disco Logo */}
      <div style={{
        padding: '4rem 2rem 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Spinning Disco Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo-disco" style={{ margin: '0 auto' }} />
        </div>
        
        <h1 className="reactive-title glow-text" style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 6rem)', 
          marginBottom: '1rem',
          letterSpacing: '3px'
        }}>
          ⚡ FELICITY 2026 ⚡
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
          color: '#00ffff',
          marginBottom: '0.5rem',
          fontWeight: '700',
          fontFamily: "'Bungee', cursive",
          textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          GROOVE INTO THE FUTURE
        </p>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)',
          color: '#ffff00',
          marginBottom: '3rem',
          fontWeight: '600',
          fontFamily: "'Anton', sans-serif",
          textShadow: '0 0 15px rgba(255, 255, 0, 0.8)'
        }}>
          🎭 Workshops • 🏆 Competitions • 🎪 Cultural Events
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          marginBottom: '4rem' 
        }}>
          {isAuthenticated ? (
            <>
              <Link to="/events" style={{
                background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
                color: '#fff',
                padding: '1.2rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: '700',
                border: '3px solid #ffff00',
                boxShadow: '0 0 30px rgba(255, 0, 110, 0.8), 0 0 60px rgba(131, 56, 236, 0.6)',
                transition: 'all 0.3s ease',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                � Browse Events
              </Link>
              <Link to="/dashboard" style={{
                background: 'linear-gradient(135deg, #3a86ff 0%, #00ffff 100%)',
                color: '#000',
                padding: '1.2rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: '700',
                border: '3px solid #ff006e',
                boxShadow: '0 0 30px rgba(58, 134, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.6)',
                transition: 'all 0.3s ease',
                textShadow: '0 2px 4px rgba(255,255,255,0.5)'
              }}>
                📊 My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
                color: '#fff',
                padding: '1.2rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: '700',
                border: '3px solid #00ffff',
                boxShadow: '0 0 30px rgba(255, 0, 110, 0.8), 0 0 60px rgba(255, 190, 11, 0.6)',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s ease-in-out infinite',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                ✨ Register Now
              </Link>
              <Link to="/events" style={{
                background: 'transparent',
                color: '#ffff00',
                padding: '1.2rem 2.5rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: '700',
                border: '3px solid #ffff00',
                boxShadow: '0 0 20px rgba(255, 255, 0, 0.6)',
                transition: 'all 0.3s ease',
                textShadow: '0 0 10px rgba(255, 255, 0, 0.8)'
              }}>
                🔍 Explore Events
              </Link>
            </>
          )}
        </div>

        {/* Features Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          position: 'relative',
          zIndex: 10
        }}>
          <div className="feature-card-disco" style={{ padding: '2.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
            <h3 style={{ 
              color: '#ff006e', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              fontFamily: "'Bungee', cursive",
              textShadow: '0 0 10px rgba(255, 0, 110, 0.8)'
            }}>
              Discover Events
            </h3>
            <p style={{ color: '#fff', lineHeight: '1.6', fontFamily: "'Anton', sans-serif" }}>
              Explore amazing workshops, competitions, and cultural events happening at Felicity 2026
            </p>
          </div>
          
          <div className="feature-card-disco" style={{ 
            padding: '2.5rem',
            borderColor: 'rgba(58, 134, 255, 0.5)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ 
              color: '#3a86ff', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              fontFamily: "'Bungee', cursive",
              textShadow: '0 0 10px rgba(58, 134, 255, 0.8)'
            }}>
              Easy Registration
            </h3>
            <p style={{ color: '#fff', lineHeight: '1.6', fontFamily: "'Anton', sans-serif" }}>
              Register for events instantly with our streamlined process and get confirmed in seconds
            </p>
          </div>
          
          <div className="feature-card-disco" style={{ 
            padding: '2.5rem',
            borderColor: 'rgba(255, 190, 11, 0.5)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ 
              color: '#ffbe0b', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              fontFamily: "'Bungee', cursive",
              textShadow: '0 0 10px rgba(255, 190, 11, 0.8)'
            }}>
              Digital Tickets
            </h3>
            <p style={{ color: '#fff', lineHeight: '1.6', fontFamily: "'Anton', sans-serif" }}>
              Get QR code tickets via email instantly for quick and hassle-free event entry
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="disco-card" style={{
          marginTop: '5rem',
          padding: '3rem 1rem',
          maxWidth: '1200px',
          margin: '5rem auto 0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div>
              <h2 className="glow-text" style={{
                fontSize: '4rem',
                fontWeight: '900',
                color: '#ffff00',
                marginBottom: '0.5rem',
                fontFamily: "'Bungee', cursive"
              }}>50+</h2>
              <p style={{ 
                color: '#fff', 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                fontFamily: "'Anton', sans-serif" 
              }}>Events</p>
            </div>
            <div>
              <h2 className="glow-text" style={{
                fontSize: '4rem',
                fontWeight: '900',
                color: '#ff00ff',
                marginBottom: '0.5rem',
                fontFamily: "'Bungee', cursive"
              }}>10K+</h2>
              <p style={{ 
                color: '#fff', 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                fontFamily: "'Anton', sans-serif" 
              }}>Participants</p>
            </div>
            <div>
              <h2 className="glow-text" style={{
                fontSize: '4rem',
                fontWeight: '900',
                color: '#00ffff',
                marginBottom: '0.5rem',
                fontFamily: "'Bungee', cursive"
              }}>3</h2>
              <p style={{ 
                color: '#fff', 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                fontFamily: "'Anton', sans-serif" 
              }}>Days of Fun</p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes glow {
            from {
              filter: drop-shadow(0 0 20px rgba(255, 0, 110, 0.5));
            }
            to {
              filter: drop-shadow(0 0 40px rgba(255, 0, 110, 0.8)) drop-shadow(0 0 60px rgba(255, 190, 11, 0.6));
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 30px rgba(255, 0, 110, 0.8), 0 0 60px rgba(255, 190, 11, 0.6);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 50px rgba(255, 0, 110, 1), 0 0 100px rgba(255, 190, 11, 0.8);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
