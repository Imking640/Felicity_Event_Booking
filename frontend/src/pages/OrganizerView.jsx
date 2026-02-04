import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const OrganizerView = () => {
  const { id } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const o = await api.get(`/organizers/${id}`);
        setOrganizer(o.data.organizer);
        const u = await api.get(`/organizers/${id}/events?scope=upcoming`);
        setUpcoming(u.data.events || []);
        const p = await api.get(`/organizers/${id}/events?scope=past`);
        setPast(p.data.events || []);
      } catch (e) { showDiscoToast('Failed to load organizer', false); }
    };
    load();
  }, [id]);

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        {!organizer ? (
          <div style={{ color: '#ccc' }}>Loading...</div>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '0.5rem' }}>{organizer.organizerName}</h1>
            <div style={{ color: '#00ffff' }}>{organizer.category}</div>
            <div style={{ marginTop: '1rem', color: '#fff' }}>{organizer.description || 'No description'}</div>

            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', marginTop: '1.5rem' }}>Upcoming Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {upcoming.map(ev => (
                <div key={ev._id} className="event-card-disco" style={{ padding: '1rem' }}>
                  <div style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>{ev.eventName}</div>
                  <div style={{ color: '#00ffff' }}>{ev.eventType}</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{new Date(ev.eventStartDate).toLocaleString()}</div>
                </div>
              ))}
              {upcoming.length === 0 && <div style={{ color: '#ccc' }}>No upcoming events</div>}
            </div>

            <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', marginTop: '1.5rem' }}>Past Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {past.map(ev => (
                <div key={ev._id} className="event-card-disco" style={{ padding: '1rem' }}>
                  <div style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>{ev.eventName}</div>
                  <div style={{ color: '#00ffff' }}>{ev.eventType}</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{new Date(ev.eventEndDate).toLocaleString()}</div>
                </div>
              ))}
              {past.length === 0 && <div style={{ color: '#ccc' }}>No past events</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerView;
