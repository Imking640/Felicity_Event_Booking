import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrganizers: 0,
    activeOrganizers: 0,
    inactiveOrganizers: 0,
    totalParticipants: 0,
    totalEvents: 0,
    totalRegistrations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard - Current user:', user);
    console.log('AdminDashboard - User role:', user?.role);
    
    const fetchStats = async () => {
      try {
        console.log('Fetching admin stats from /admin/stats');
        const res = await api.get('/admin/stats');
        console.log('Stats response:', res.data);
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Fetch stats error', err);
        console.error('Error response:', err.response?.data);
        showDiscoToast('Failed to load stats', false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Welcome Header */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div className="logo-disco" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            👑 Admin Dashboard
          </h1>
          <p style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>
            Welcome, {user?.adminName || 'Administrator'}!
          </p>
        </div>

        {/* System Statistics */}
        <div className="disco-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', marginBottom: '1.5rem' }}>
            📊 System Overview
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading statistics...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,0,0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#ffff00' }} className="glow-text">
                  {stats.totalOrganizers}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Organizers</div>
              </div>
              
              <div style={{ background: 'rgba(0,255,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,0,0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#00ff00' }} className="glow-text">
                  {stats.activeOrganizers}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Active Organizers</div>
              </div>

              <div style={{ background: 'rgba(255,0,0,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,0,0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#ff0000' }} className="glow-text">
                  {stats.inactiveOrganizers}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Disabled</div>
              </div>
              
              <div style={{ background: 'rgba(0,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(0,255,255,0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#00ffff' }} className="glow-text">
                  {stats.totalParticipants}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Participants</div>
              </div>
              
              <div style={{ background: 'rgba(255,0,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,255,0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#ff00ff' }} className="glow-text">
                  {stats.totalEvents}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Total Events</div>
              </div>
              
              <div style={{ background: 'rgba(255,0,110,0.1)', padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(255,0,110,0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Bungee', cursive", color: '#ff006e' }} className="glow-text">
                  {stats.totalRegistrations}
                </div>
                <div style={{ color: '#ddd', marginTop: '0.5rem' }}>Registrations</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="feature-card-disco" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/admin/manage-organizers')}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ color: '#00ffff', fontSize: '1.5rem', marginBottom: '1rem', fontFamily: "'Bungee', cursive" }}>
              Manage Organizers
            </h3>
            <p style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: "'Anton', sans-serif" }}>
              Create, view, and manage all organizer accounts
            </p>
            <button className="disco-button" style={{ width: '100%' }}>
              🔧 Manage
            </button>
          </div>

          <div className="feature-card-disco" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/admin/password-resets')}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
            <h3 style={{ color: '#ffff00', fontSize: '1.5rem', marginBottom: '1rem', fontFamily: "'Bungee', cursive" }}>
              Password Reset Requests
            </h3>
            <p style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: "'Anton', sans-serif" }}>
              View and process organizer password reset requests
            </p>
            <button className="disco-button" style={{ width: '100%' }}>
              🔐 View Requests
            </button>
          </div>

          <div className="feature-card-disco" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ color: '#ff00ff', fontSize: '1.5rem', marginBottom: '1rem', fontFamily: "'Bungee', cursive" }}>
              System Reports
            </h3>
            <p style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: "'Anton', sans-serif" }}>
              View detailed analytics and reports
            </p>
            <button className="disco-button" disabled style={{ width: '100%', opacity: 0.5 }}>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
