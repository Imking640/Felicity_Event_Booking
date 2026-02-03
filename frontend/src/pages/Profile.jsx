import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DiscoDecorations, { showDiscoToast, createConfetti } from '../components/DiscoDecorations';

const DEFAULT_INTERESTS = [
  'Technical', 'Cultural', 'Sports', 'Gaming', 'Workshop', 'Music', 'Dance', 'Art', 'Drama', 'Photography'
];

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', contactNumber: '', college: ''
  });
  const [organizers, setOrganizers] = useState([]);
  const [interests, setInterests] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'participant') return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      contactNumber: user.contactNumber || '',
      college: user.college || ''
    });
    setInterests(user.interests || []);
    setFollowed((user.followedClubs || []).map(String));

    const load = async () => {
      try {
        const res = await api.get('/auth/organizers');
        setOrganizers(res.data.organizers || []);
      } catch (e) {}
    };
    load();
  }, [user]);

  const toggleInterest = (i) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const toggleClub = (id) => setFollowed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        ...form,
        interests,
        followedClubs: followed
      });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        createConfetti();
        showDiscoToast('Profile updated!', true);
      }
    } catch (e) {
      showDiscoToast('Failed to update', false);
    } finally { setSaving(false); }
  };

  if (user?.role !== 'participant') {
    return (
      <div style={{ minHeight: '60vh', padding: '2rem', color: '#fff' }}>
        <DiscoDecorations />
        <div className="disco-card" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
          Only participants can edit these preferences.
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '2rem', color: '#fff' }}>
      <DiscoDecorations />
      <div className="disco-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Bungee', cursive", color: '#ffff00', marginBottom: '1rem' }}>My Profile</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="disco-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>Personal Info</h3>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <input className="disco-input" placeholder="First Name" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} />
              <input className="disco-input" placeholder="Last Name" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} />
              <input className="disco-input" placeholder="Contact Number" value={form.contactNumber} onChange={e=>setForm({...form, contactNumber:e.target.value})} />
              <input className="disco-input" placeholder="College" value={form.college} onChange={e=>setForm({...form, college:e.target.value})} />
            </div>
          </div>

          <div className="disco-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>Areas of Interest</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {DEFAULT_INTERESTS.map(t => (
                <button key={t} type="button" className="disco-button" onClick={()=>toggleInterest(t)}
                  style={{ padding: '0.5rem 0.8rem', background: interests.includes(t) ? 'linear-gradient(90deg,#ff00ff,#00ffff)' : 'rgba(0,0,0,0.5)' }}>
                  {interests.includes(t) ? '✅ ' : ''}{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="disco-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ color: '#ff00ff', fontFamily: "'Bungee', cursive", marginBottom: '1rem' }}>Clubs / Organizers</h3>
          <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 8 }}>
            {organizers.map(org => (
              <label key={org._id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={followed.includes(org._id)} onChange={()=>toggleClub(org._id)} />
                <span style={{ fontFamily: "'Anton', sans-serif" }}>{org.organizerName}</span>
                <span style={{ marginLeft: 'auto', color: '#00ffff' }}>{org.category}</span>
              </label>
            ))}
            {organizers.length === 0 && <div style={{ color: '#ccc' }}>No organizers yet</div>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="disco-button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
