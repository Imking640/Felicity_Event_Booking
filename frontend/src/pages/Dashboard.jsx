import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#667eea', marginBottom: '2rem' }}>
        Welcome, {user?.firstName || user?.organizerName}!
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Your Profile</h2>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          {user?.participantType && <p><strong>Type:</strong> {user.participantType}</p>}
          {user?.college && <p><strong>College:</strong> {user.college}</p>}
          {user?.contactNumber && <p><strong>Contact:</strong> {user.contactNumber}</p>}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <div style={{
          backgroundColor: '#667eea',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>0</h3>
          <p>Registered Events</p>
        </div>
        
        <div style={{
          backgroundColor: '#764ba2',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>0</h3>
          <p>Attended Events</p>
        </div>
        
        <div style={{
          backgroundColor: '#48c774',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>0</h3>
          <p>Upcoming Events</p>
        </div>
      </div>

      <div style={{ 
        marginTop: '2rem',
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>My Registrations</h2>
        <p style={{ color: '#666' }}>No registrations yet. Browse events to get started!</p>
      </div>
    </div>
  );
};

export default Dashboard;
