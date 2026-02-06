import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrganizersList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedClubs, setFollowedClubs] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const isParticipant = isAuthenticated && user?.role === 'participant';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/organizers');
        setList(res.data.organizers || []);
        // Load followed clubs from user data
        if (isParticipant && user?.followedClubs) {
          setFollowedClubs(user.followedClubs.map(String));
        }
      } catch (e) { showDiscoToast('Failed to load organizers', false); }
      finally { setLoading(false); }
    };
    load();
  }, [isParticipant, user]);

  const handleFollow = async (orgId) => {
    try {
      const res = await api.post(`/organizers/${orgId}/follow`);
      if (res.data.success) {
        setFollowedClubs(res.data.followedClubs.map(String));
        showDiscoToast('Followed club!', true);
      }
    } catch (e) {
      showDiscoToast('Failed to follow', false);
    }
  };

  const handleUnfollow = async (orgId) => {
    try {
      const res = await api.delete(`/organizers/${orgId}/follow`);
      if (res.data.success) {
        setFollowedClubs(res.data.followedClubs.map(String));
        showDiscoToast('Unfollowed club', true);
      }
    } catch (e) {
      showDiscoToast('Failed to unfollow', false);
    }
  };

  const isFollowing = (orgId) => followedClubs.includes(String(orgId));

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1rem' }}>Clubs / Organizers</h1>
        {loading ? (
          <div style={{ color: '#ccc' }}>Loading...</div>
        ) : list.length === 0 ? (
          <div style={{ color: '#ccc' }}>No organizers found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {list.map(org => (
              <div key={org._id} className="event-card-disco" style={{ padding: '1.2rem' }}>
                <div style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                  {org.organizerName}
                </div>
                <div style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif", fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {org.category}
                </div>
                <div style={{ 
                  color: '#ccc', 
                  fontSize: '0.85rem', 
                  marginBottom: '0.8rem',
                  lineHeight: '1.4',
                  maxHeight: '3.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {org.description || 'No description available'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link to={`/organizers/${org._id}`} className="disco-button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    View Club
                  </Link>
                  {isParticipant && (
                    isFollowing(org._id) ? (
                      <button 
                        className="disco-button" 
                        onClick={() => handleUnfollow(org._id)}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          fontSize: '0.85rem',
                          background: 'linear-gradient(90deg, #ff4444, #ff6666)',
                          border: '2px solid #ff4444'
                        }}
                      >
                        ❌ Unfollow
                      </button>
                    ) : (
                      <button 
                        className="disco-button" 
                        onClick={() => handleFollow(org._id)}
                        style={{ 
                          padding: '0.5rem 1rem', 
                          fontSize: '0.85rem',
                          background: 'linear-gradient(90deg, #00ff00, #00cc00)',
                          border: '2px solid #00ff00'
                        }}
                      >
                        ➕ Follow
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizersList;
