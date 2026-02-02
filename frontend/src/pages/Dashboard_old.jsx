import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)'
    }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          padding: '2.5rem',
          borderRadius: '30px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          marginBottom: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '3rem',
            opacity: 0.5
          }}
        >
          🎪
        </motion.div>
        
        <motion.h1
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            fontSize: '2.5rem',
            fontWeight: '900',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome back, {user?.firstName || user?.organizerName}! 🎉
        </motion.h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          Ready to make Felicity 2026 unforgettable?
        </p>
      </motion.div>
      
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          padding: '2rem', 
          borderRadius: '25px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              marginRight: '1.5rem',
              boxShadow: '0 5px 20px rgba(245,87,108,0.4)'
            }}
          >
            {user?.role === 'Organizer' ? '👑' : '🎓'}
          </motion.div>
          <div>
            <h2 style={{ 
              color: 'white', 
              fontSize: '1.8rem',
              fontWeight: '800',
              marginBottom: '0.25rem'
            }}>
              Your Profile
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              Your personal information
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem' 
        }}>
          <InfoBox icon="📧" label="Email" value={user?.email} />
          <InfoBox icon="🎭" label="Role" value={user?.role} />
          {user?.participantType && <InfoBox icon="🎓" label="Type" value={user.participantType} />}
          {user?.college && <InfoBox icon="🏫" label="College" value={user.college} />}
          {user?.contactNumber && <InfoBox icon="📱" label="Contact" value={user.contactNumber} />}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard 
          icon="🎫" 
          value="0" 
          label="Registered Events"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          delay={0.3}
        />
        <StatCard 
          icon="✅" 
          value="0" 
          label="Attended Events"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          delay={0.4}
        />
        <StatCard 
          icon="📅" 
          value="0" 
          label="Upcoming Events"
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          delay={0.5}
        />
      </motion.div>

      {/* Registrations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          padding: '2.5rem', 
          borderRadius: '25px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          textAlign: 'center'
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '4rem', marginBottom: '1rem' }}
        >
          🎪
        </motion.div>
        <h2 style={{ 
          color: 'white', 
          fontSize: '1.8rem',
          fontWeight: '800',
          marginBottom: '1rem'
        }}>
          My Registrations
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '1.1rem',
          marginBottom: '2rem'
        }}>
          No registrations yet. Let's change that!
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/events')}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '1rem 2.5rem',
            border: 'none',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(245, 87, 108, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          🎉 Browse Events
        </motion.button>
      </motion.div>
    </div>
  );
};

// Helper Components
const InfoBox = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '1rem',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}
  >
    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
    <div>
      <p style={{ 
        fontSize: '0.75rem', 
        color: 'rgba(255,255,255,0.7)', 
        marginBottom: '0.25rem',
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: '0.05em'
      }}>
        {label}
      </p>
      <p style={{ 
        fontSize: '1rem', 
        color: 'white', 
        fontWeight: '700'
      }}>
        {value}
      </p>
    </div>
  </motion.div>
);

const StatCard = ({ icon, value, label, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    style={{
      background: gradient,
      padding: '2rem',
      borderRadius: '25px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <motion.div
      animate={{ 
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
    >
      {icon}
    </motion.div>
    <motion.h3
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ 
        fontSize: '3rem', 
        marginBottom: '0.5rem',
        color: 'white',
        fontWeight: '900'
      }}
    >
      {value}
    </motion.h3>
    <p style={{ 
      color: 'rgba(255,255,255,0.95)', 
      fontSize: '1.1rem',
      fontWeight: '600'
    }}>
      {label}
    </p>
  </motion.div>
);

export default Dashboard;
