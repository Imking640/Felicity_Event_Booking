import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { createConfetti, showDiscoToast } from '../components/DiscoDecorations';
import DiscoDecorations from '../components/DiscoDecorations';

const EventParticipants = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}/registrations`);
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Fetch registrations error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to load participants', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line
  }, [id]);

  const handleVerify = async (registrationId, approve = true) => {
    try {
      const res = await api.post(`/registrations/${registrationId}/verify-payment`, { approved: approve });
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Payment verified', true);
        fetchRegistrations();
      }
    } catch (err) {
      showDiscoToast(err.response?.data?.message || 'Verification failed', false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>👥 Participants</h2>

        {loading ? (
          <div style={{ padding: '2rem' }}>Loading participants...</div>
        ) : registrations.length === 0 ? (
          <div style={{ padding: '2rem' }}>No registrations yet for this event.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {registrations.map(r => (
              <div key={r._id} className="event-card-disco" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.participant?.firstName} {r.participant?.lastName}</div>
                  <div style={{ color: '#ccc' }}>{r.participant?.email}</div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>Status: {r.status} • Payment: {r.paymentStatus}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {r.paymentStatus === 'pending' && (
                    <button className="disco-button" onClick={() => handleVerify(r._id, true)}>✅ Approve</button>
                  )}
                  <button className="disco-button" onClick={() => navigator.clipboard.writeText(r.participant?.email || '')}>📧 Copy Email</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventParticipants;
