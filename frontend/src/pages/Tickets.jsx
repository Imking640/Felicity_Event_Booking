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

  const downloadQR = (qrCode, ticketId) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket_${ticketId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showDiscoToast('QR Code downloaded!', true);
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1rem' }}>🎫 My Tickets</h1>
        {loading ? (
          <div style={{ color: '#ccc' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ color: '#ccc' }}>No tickets yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {tickets.map(t => (
              <div key={t._id} className="event-card-disco" style={{ padding: '1.5rem' }}>
                <div style={{ fontFamily: "'Bungee', cursive", color: '#ff00ff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {t.event?.eventName}
                </div>
                <div style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif", marginBottom: '0.5rem' }}>
                  {t.event?.eventType}
                </div>
                <div style={{ color: '#ddd', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  📅 {t.event?.eventStartDate ? new Date(t.event.eventStartDate).toLocaleDateString() : 'TBA'}
                </div>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '0.75rem', 
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Ticket ID</div>
                  <div style={{ 
                    color: '#fff', 
                    fontSize: '0.9rem', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {t.ticketId}
                  </div>
                  <button 
                    className="disco-button" 
                    style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem' }} 
                    onClick={() => copyId(t.ticketId)}
                  >
                    📋 Copy ID
                  </button>
                </div>
                
                {t.qrCode && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-block',
                      background: '#fff', 
                      padding: '0.75rem', 
                      borderRadius: '12px',
                      marginBottom: '1rem'
                    }}>
                      <img 
                        src={t.qrCode} 
                        alt="QR" 
                        style={{ 
                          width: '200px', 
                          height: '200px',
                          display: 'block'
                        }} 
                      />
                    </div>
                    <button 
                      className="disco-button" 
                      style={{ width: '100%', padding: '0.75rem' }} 
                      onClick={() => downloadQR(t.qrCode, t.ticketId)}
                    >
                      📥 Download QR Code
                    </button>
                  </div>
                )}
                
                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: t.status === 'valid' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 0, 0.1)',
                  borderRadius: '8px',
                  border: t.status === 'valid' ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 255, 0, 0.3)',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: t.status === 'valid' ? '#00ff88' : '#ffff00'
                }}>
                  {t.status === 'valid' && '✅ Valid'}
                  {t.status === 'used' && '✓ Used'}
                  {t.status === 'expired' && '⏰ Expired'}
                  {t.status === 'cancelled' && '❌ Cancelled'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
