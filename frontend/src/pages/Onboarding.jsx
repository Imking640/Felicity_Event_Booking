import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';

const DEFAULT_INTERESTS = [
  'Technical', 'Cultural', 'Sports', 'Gaming', 'Workshop', 'Music', 'Dance', 'Art', 'Drama', 'Photography'
];

const Onboarding = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'participant') {
      navigate('/dashboard');
      return;
    }

    const load = async () => {
      try {
        const res = await api.get('/auth/organizers');
        setOrganizers(res.data.organizers || []);
      } catch (e) {
        console.error('Load organizers failed', e);
      }
    };
    load();
  }, [isAuthenticated, user, navigate]);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const toggleClub = (id) => {
    setSelectedClubs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        interests: selectedInterests,
        followedClubs: selectedClubs
      });
      if (res.data.success) {
        // update local user cache
        localStorage.setItem('user', JSON.stringify(res.data.user));
        createConfetti();
        showDiscoToast('Preferences saved!', true);
        navigate('/dashboard');
      }
    } catch (e) {
      console.error('Save prefs error', e);
      showDiscoToast('Failed to save preferences', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1rem' }}>Customize Your Experience</h1>
        <p style={{ color: '#00ffff', fontFamily: "'Anton', sans-serif", marginBottom: '1.5rem' }}>Pick your interests and follow clubs. You can change these later in your profile.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="disco-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>Areas of Interest</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {DEFAULT_INTERESTS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleInterest(tag)}
                  className="disco-button"
                  style={{ padding: '0.5rem 0.8rem', background: selectedInterests.includes(tag) ? 'linear-gradient(90deg,#ff00ff,#00ffff)' : 'rgba(0,0,0,0.5)' }}>
                  {selectedInterests.includes(tag) ? '✅ ' : ''}{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="disco-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>Clubs / Organizers to Follow</h3>
            <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 8 }}>
              {organizers.map(org => (
                <label key={org._id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <input type="checkbox" checked={selectedClubs.includes(org._id)} onChange={() => toggleClub(org._id)} />
                  <span style={{ fontFamily: "'Anton', sans-serif" }}>{org.organizerName}</span>
                  <span style={{ marginLeft: 'auto', color: '#00ffff' }}>{org.category}</span>
                </label>
              ))}
              {organizers.length === 0 && <div style={{ color: '#ccc' }}>No organizers yet</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="disco-button" onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(90deg,#444,#111)' }}>Skip for now</button>
          <button className="disco-button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
