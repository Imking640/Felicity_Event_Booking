import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';
import { Link } from 'react-router-dom';

const OrganizersList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/organizers');
        setList(res.data.organizers || []);
      } catch (e) { showDiscoToast('Failed to load organizers', false); }
      finally { setLoading(false); }
    };
    load();
  }, []);

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {list.map(org => (
              <div key={org._id} className="event-card-disco" style={{ padding: '1rem' }}>
                <div style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff' }}>{org.organizerName}</div>
                <div style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>{org.category}</div>
                <Link to={`/organizers/${org._id}`} className="disco-button" style={{ marginTop: 8, display: 'inline-block' }}>View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizersList;
