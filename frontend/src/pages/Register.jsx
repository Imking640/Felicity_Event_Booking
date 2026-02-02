import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    participantType: 'IIIT',
    college: '',
    contactNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1.2rem',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '15px',
    fontSize: '1rem',
    color: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
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
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(245,87,108,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(102,126,234,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '30px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          width: '100%',
          maxWidth: '550px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
          >
            🎉
          </motion.div>
          <h2 style={{ 
            color: 'white', 
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: '0.5rem'
          }}>
            Join Felicity 2026!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
            Create your account and start exploring
          </p>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(255, 59, 48, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '1rem',
              borderRadius: '15px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              fontWeight: '500'
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'white', 
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                👤 First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="John"
                onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'white', 
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                👤 Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Doe"
                onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: 'white', 
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              📧 Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="your.email@example.com"
              onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: 'white', 
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              🔒 Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={inputStyle}
              placeholder="At least 6 characters"
              onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: 'white', 
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              🎓 Participant Type
            </label>
            <select
              name="participantType"
              value={formData.participantType}
              onChange={handleChange}
              style={{
                ...inputStyle,
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
            >
              <option value="IIIT" style={{ background: '#667eea', color: 'white' }}>IIIT Student</option>
              <option value="Non-IIIT" style={{ background: '#667eea', color: 'white' }}>Non-IIIT Student</option>
            </select>
          </div>

          {formData.participantType === 'Non-IIIT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: '1rem' }}
            >
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'white', 
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                🏫 College Name
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Your College Name"
                onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
              />
            </motion.div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: 'white', 
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              📱 Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              style={inputStyle}
              placeholder="10-digit mobile number"
              onFocus={(e) => e.target.style.border = '1px solid rgba(240,147,251,0.8)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? 'rgba(150, 150, 150, 0.5)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 30px rgba(245, 87, 108, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Creating Account...' : '🚀 Register Now'}
          </motion.button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1.5rem 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Login Here →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
