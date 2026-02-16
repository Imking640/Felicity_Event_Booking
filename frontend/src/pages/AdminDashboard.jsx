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
  const [securityStats, setSecurityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard - Current user:', user);
    console.log('AdminDashboard - User role:', user?.role);
    
    const fetchStats = async () => {
      try {
        console.log('Fetching admin stats from /admin/stats');
        const [statsRes, secRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/security-stats')
        ]);
        console.log('Stats response:', statsRes.data);
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (secRes.data.success) {
          setSecurityStats(secRes.data.stats);
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

        {/* Security Dashboard */}
        <div className="disco-card" style={{ padding: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff006e', margin: 0 }}>
              🛡️ Security Dashboard
            </h2>
            <button 
              className="disco-button" 
              onClick={() => setShowSecurityDetails(!showSecurityDetails)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {showSecurityDetails ? '➖ Hide Details' : '➕ Show Details'}
            </button>
          </div>
          
          {securityStats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: securityStats.blockedIPs > 0 ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: securityStats.blockedIPs > 0 ? '2px solid rgba(255,0,0,0.5)' : '2px solid rgba(0,255,0,0.3)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: securityStats.blockedIPs > 0 ? '#ff4444' : '#00ff00' }}>
                    {securityStats.blockedIPs}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ccc' }}>Blocked IPs</div>
                </div>
                
                <div style={{ background: securityStats.suspiciousAttempts > 0 ? 'rgba(255,165,0,0.2)' : 'rgba(0,255,0,0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: securityStats.suspiciousAttempts > 0 ? '2px solid rgba(255,165,0,0.5)' : '2px solid rgba(0,255,0,0.3)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: securityStats.suspiciousAttempts > 0 ? '#ffa500' : '#00ff00' }}>
                    {securityStats.suspiciousAttempts}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ccc' }}>Suspicious Activity</div>
                </div>
                
                <div style={{ background: 'rgba(0,255,255,0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '2px solid rgba(0,255,255,0.3)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00ffff' }}>
                    {securityStats.pendingVerifications}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ccc' }}>Pending Verifications</div>
                </div>
                
                <div style={{ background: 'rgba(255,0,255,0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '2px solid rgba(255,0,255,0.3)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff00ff' }}>
                    {securityStats.activeOTPs}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ccc' }}>Active OTPs</div>
                </div>
              </div>
              
              {/* Security Status Banner */}
              <div style={{ 
                background: securityStats.blockedIPs === 0 && securityStats.suspiciousAttempts === 0 
                  ? 'linear-gradient(90deg, rgba(0,255,0,0.2), rgba(0,200,0,0.1))' 
                  : 'linear-gradient(90deg, rgba(255,165,0,0.2), rgba(255,100,0,0.1))',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '2rem' }}>
                  {securityStats.blockedIPs === 0 && securityStats.suspiciousAttempts === 0 ? '✅' : '⚠️'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>
                    {securityStats.blockedIPs === 0 && securityStats.suspiciousAttempts === 0 
                      ? 'System Secure' 
                      : 'Security Alert'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                    {securityStats.blockedIPs === 0 && securityStats.suspiciousAttempts === 0 
                      ? 'No suspicious activity detected. Rate limiting & CAPTCHA active.' 
                      : `${securityStats.blockedIPs} IP(s) blocked, ${securityStats.suspiciousAttempts} suspicious attempt(s) detected.`}
                  </div>
                </div>
              </div>
              
              {/* Detailed Security Log */}
              {showSecurityDetails && securityStats.recentAttempts && securityStats.recentAttempts.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ color: '#00ffff', marginBottom: '0.75rem' }}>Recent Suspicious Activity</h4>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00ffff' }}>IP Address</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00ffff' }}>Email</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: '#00ffff' }}>Attempts</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', color: '#00ffff' }}>Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', color: '#00ffff' }}>Last Attempt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityStats.recentAttempts.map((item, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '0.75rem', color: '#fff' }}>{item.ip}</td>
                            <td style={{ padding: '0.75rem', color: '#ccc' }}>{item.email}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: item.attempts >= 5 ? '#ff4444' : '#ffa500' }}>{item.attempts}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{ 
                                background: item.isBlocked ? 'rgba(255,0,0,0.3)' : 'rgba(255,165,0,0.3)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: item.isBlocked ? '#ff6666' : '#ffcc00'
                              }}>
                                {item.isBlocked ? '🔒 BLOCKED' : '⚠️ WARNING'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: '#888' }}>
                              {new Date(item.lastAttempt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {showSecurityDetails && (!securityStats.recentAttempts || securityStats.recentAttempts.length === 0) && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2rem', background: 'rgba(0,255,0,0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                  <div style={{ color: '#00ff00' }}>No suspicious activity in the logs!</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
