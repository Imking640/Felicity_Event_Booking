import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#667eea', marginBottom: '1rem' }}>
        Welcome to Felicity Event Management
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
        Discover, Register, and Manage Events with Ease
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
        {isAuthenticated ? (
          <>
            <Link to="/events" style={{
              backgroundColor: '#667eea',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              Browse Events
            </Link>
            <Link to="/dashboard" style={{
              backgroundColor: '#764ba2',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              My Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link to="/register" style={{
              backgroundColor: '#667eea',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              Get Started
            </Link>
            <Link to="/events" style={{
              backgroundColor: 'white',
              color: '#667eea',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              border: '2px solid #667eea'
            }}>
              Explore Events
            </Link>
          </>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        marginTop: '3rem'
      }}>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>🎭 Discover Events</h3>
          <p style={{ color: '#666' }}>
            Browse through exciting workshops, competitions, and cultural events
          </p>
        </div>
        
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>📝 Easy Registration</h3>
          <p style={{ color: '#666' }}>
            Register for events with just a few clicks and get instant confirmation
          </p>
        </div>
        
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>🎫 Digital Tickets</h3>
          <p style={{ color: '#666' }}>
            Receive QR code tickets instantly via email for hassle-free entry
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
