import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast } from '../components/DiscoDecorations';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/registrations/tickets');
        setTickets(res.data.tickets || []);
      } catch (e) {
        showDiscoToast('Failed to fetch tickets', false);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const copyId = async (id) => {
    try { await navigator.clipboard.writeText(id); showDiscoToast('Ticket ID copied!', true); } catch {}
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1rem' }}>My Tickets</h1>
        {loading ? (
          <div style={{ color: '#ccc' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ color: '#ccc' }}>No tickets yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {tickets.map(t => (
              <div key={t._id} className="event-card-disco" style={{ padding: '1rem' }}>
                <div style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff' }}>{t.event?.eventName}</div>
                <div style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif" }}>{t.event?.eventType}</div>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>ID: {t.ticketId} <button className="disco-button" style={{ marginLeft: 8 }} onClick={()=>copyId(t.ticketId)}>Copy</button></div>
                {t.qrCode && <img src={t.qrCode} alt="QR" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
