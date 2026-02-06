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
            {/* Club Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255,0,255,0.2), rgba(0,255,255,0.2))',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '2px solid rgba(255,255,0,0.3)'
            }}>
              <h1 style={{ 
                fontFamily: "'Bungee', cursive", 
                color: '#ffff00', 
                marginBottom: '0.5rem',
                fontSize: '2rem'
              }}>
                {organizer.organizerName}
              </h1>
              <div style={{ 
                color: '#00ffff', 
                fontFamily: "'Anton', sans-serif",
                fontSize: '1.1rem',
                marginBottom: '0.8rem'
              }}>
                {organizer.category}
              </div>
              <div style={{ 
                marginTop: '0.8rem', 
                color: '#fff',
                lineHeight: '1.5',
                fontSize: '0.95rem'
              }}>
                {organizer.description || 'No description available'}
              </div>
              <div style={{ 
                marginTop: '1rem', 
                color: '#ff00ff',
                fontFamily: "'Anton', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>📧</span>
                <span style={{ color: '#00ffff' }}>Contact:</span>
                <a 
                  href={`mailto:${organizer.contactEmail}`}
                  style={{ 
                    color: '#ffff00', 
                    textDecoration: 'none',
                    borderBottom: '1px dashed #ffff00'
                  }}
                >
                  {organizer.contactEmail}
                </a>
              </div>
            </div>

            {/* Upcoming Events Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontFamily: "'Bungee', cursive", 
                color: '#ff00ff', 
                marginBottom: '1rem',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🎉</span> Upcoming Events
              </h2>
              {upcoming.length === 0 ? (
                <div style={{ 
                  color: '#ccc', 
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  No upcoming events
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '1rem' 
                }}>
                  {upcoming.map(ev => (
                    <div 
                      key={ev._id} 
                      className="event-card-disco" 
                      style={{ 
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ 
                        fontFamily: "'Bungee', cursive", 
                        color: '#ffff00',
                        fontSize: '1rem'
                      }}>
                        {ev.eventName}
                      </div>
                      <div style={{ 
                        color: '#00ffff',
                        fontSize: '0.85rem',
                        fontFamily: "'Anton', sans-serif"
                      }}>
                        {ev.eventType}
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <span>📅</span>
                        {new Date(ev.eventStartDate).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Events Section */}
            <div>
              <h2 style={{ 
                fontFamily: "'Bungee', cursive", 
                color: '#ff00ff', 
                marginBottom: '1rem',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>📜</span> Past Events
              </h2>
              {past.length === 0 ? (
                <div style={{ 
                  color: '#ccc', 
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  No past events
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '1rem' 
                }}>
                  {past.map(ev => (
                    <div 
                      key={ev._id} 
                      className="event-card-disco" 
                      style={{ 
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        opacity: '0.85'
                      }}
                    >
                      <div style={{ 
                        fontFamily: "'Bungee', cursive", 
                        color: '#ffff00',
                        fontSize: '1rem'
                      }}>
                        {ev.eventName}
                      </div>
                      <div style={{ 
                        color: '#00ffff',
                        fontSize: '0.85rem',
                        fontFamily: "'Anton', sans-serif"
                      }}>
                        {ev.eventType}
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <span>📅</span>
                        {new Date(ev.eventEndDate).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerView;
