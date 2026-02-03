import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DiscoDecorations, { createConfetti, showDiscoToast } from '../components/DiscoDecorations';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventName: '',
    eventDescription: '',
    eventType: 'Normal',
    eventStartDate: '',
    eventEndDate: '',
    registrationLimit: 100,
    registrationFee: 0,
    registrationDeadline: '',
    venue: '',
    tags: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        createConfetti();
        showDiscoToast('Event created as draft! Publish it when ready.', true);
        navigate('/organizer/events');
      }
    } catch (err) {
      console.error('Create event error', err);
      showDiscoToast(err.response?.data?.message || 'Failed to create event', false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(255,255,255,0.04)', padding: '2rem', borderRadius: 12 }}>
        <h2 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00' }}>➕ Create Event</h2>
        <p style={{ color: '#ddd' }}>Create a new event (saved as draft). You can publish it later.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <input name="eventName" value={form.eventName} onChange={handleChange} placeholder="Event Name" className="disco-input" required />
          <textarea name="eventDescription" value={form.eventDescription} onChange={handleChange} placeholder="Description" className="disco-input" rows={5} required />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select name="eventType" value={form.eventType} onChange={handleChange} className="disco-input">
              <option>Normal</option>
              <option>Technical</option>
              <option>Cultural</option>
              <option>Sports</option>
              <option>Workshop</option>
              <option>Merchandise</option>
            </select>

            <input name="venue" value={form.venue} onChange={handleChange} placeholder="Venue" className="disco-input" />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="date" name="eventStartDate" value={form.eventStartDate} onChange={handleChange} className="disco-input" required />
            <input type="date" name="eventEndDate" value={form.eventEndDate} onChange={handleChange} className="disco-input" required />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="number" name="registrationLimit" value={form.registrationLimit} onChange={handleChange} className="disco-input" min={0} />
            <input type="number" name="registrationFee" value={form.registrationFee} onChange={handleChange} className="disco-input" min={0} />
            <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className="disco-input" />
          </div>

          <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="disco-input" />

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className="disco-button" disabled={loading}>{loading ? '⏳ Creating...' : '✨ Create Event'}</button>
            <button type="button" className="disco-button" onClick={() => navigate('/organizer/events')} style={{ background: 'linear-gradient(90deg,#333,#111)' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
