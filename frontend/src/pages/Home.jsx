import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)',
      padding: '0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated Background Circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,0,110,0.4) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0,
        filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s',
        zIndex: 0,
        filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(131,56,236,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite',
        animationDelay: '4s',
        zIndex: 0,
        filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)'
      }} />
      
      {/* Floating Geometric Shapes */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '15%',
        width: '80px',
        height: '80px',
        border: '3px solid rgba(255, 255, 0, 0.5)',
        animation: 'rotate 20s linear infinite, float 5s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '20%',
        width: '60px',
        height: '60px',
        border: '3px solid rgba(255, 0, 110, 0.5)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite',
        animationDelay: '1s',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '25%',
        width: '0',
        height: '0',
        borderLeft: '40px solid transparent',
        borderRight: '40px solid transparent',
        borderBottom: '70px solid rgba(0, 255, 255, 0.4)',
        animation: 'float 9s ease-in-out infinite',
        animationDelay: '3s',
        zIndex: 0
      }} />

      {/* Hero Section */}
      <div style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
          fontWeight: '900',
          background: 'linear-gradient(90deg, #ff006e 0%, #ffbe0b 50%, #00ffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
          textShadow: '0 0 80px rgba(255, 0, 110, 0.5)',
          animation: 'glow 2s ease-in-out infinite alternate',
          letterSpacing: '3px'
        }}>
          ⚡ FELICITY 2026 ⚡
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          color: '#00ffff',
          marginBottom: '1rem',
          fontWeight: '600',
          textShadow: '0 0 20px rgba(0, 255, 255, 0.8)'
        }}>
          The Ultimate College Fest Experience
        </p>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)',
          color: '#ffff00',
          marginBottom: '3rem',
          fontWeight: '500',
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
          padding: '0 1rem'
        }}>
          <div style={{ 
            padding: '2.5rem', 
            background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(131, 56, 236, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 0, 110, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(255, 0, 110, 0.3)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
            <h3 style={{ 
              color: '#ff006e', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(255, 0, 110, 0.8)'
            }}>
              Discover Events
            </h3>
            <p style={{ color: '#fff', lineHeight: '1.6' }}>
              Explore amazing workshops, competitions, and cultural events happening at Felicity 2026
            </p>
          </div>
          
          <div style={{ 
            padding: '2.5rem', 
            background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.2) 0%, rgba(0, 255, 255, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(58, 134, 255, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(58, 134, 255, 0.3)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ 
              color: '#3a86ff', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(58, 134, 255, 0.8)'
            }}>
              Easy Registration
            </h3>
            <p style={{ color: '#fff', lineHeight: '1.6' }}>
              Register for events instantly with our streamlined process and get confirmed in seconds
            </p>
          </div>
          
          <div style={{ 
            padding: '2.5rem', 
            background: 'linear-gradient(135deg, rgba(255, 190, 11, 0.2) 0%, rgba(255, 0, 110, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 190, 11, 0.5)',
            boxShadow: '0 8px 32px 0 rgba(255, 190, 11, 0.3)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ 
              color: '#ffbe0b', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              textShadow: '0 0 10px rgba(255, 190, 11, 0.8)'
            }}>
              Digital Tickets
            </h3>
            <p style={{ color: '#fff', lineHeight: '1.6' }}>
              Get QR code tickets via email instantly for quick and hassle-free event entry
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          marginTop: '5rem',
          padding: '3rem 1rem',
          background: 'linear-gradient(90deg, rgba(255, 0, 110, 0.1) 0%, rgba(131, 56, 236, 0.1) 50%, rgba(0, 255, 255, 0.1) 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
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
              <h2 style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(90deg, #ff006e 0%, #ffbe0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>50+</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>Events</p>
            </div>
            <div>
              <h2 style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(90deg, #8338ec 0%, #3a86ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>10K+</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>Participants</p>
            </div>
            <div>
              <h2 style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(90deg, #3a86ff 0%, #00ffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>3</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>Days of Fun</p>
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
