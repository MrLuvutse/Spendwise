import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name:     user?.name     || '',
    currency: user?.currency || 'USD',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [msg,    setMsg]    = useState('');
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);

  const currencies = ['USD','EUR','GBP','KES','ZAR','NGN','GHS','TZS','UGX','INR','AED'];

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(''); setError('');
    try {
      await api.put('/auth/profile', form);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm)
      return setError('New passwords do not match');
    if (passwords.newPass.length < 6)
      return setError('Password must be at least 6 characters');
    setSaving(true); setMsg(''); setError('');
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass,
      });
      setMsg('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>👤 Profile</h1>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '20px' }}>Edit Profile</h2>
          <form onSubmit={handleProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {msg   && <p className="success-msg">{msg}</p>}
            {error && <p className="error-msg">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '16px', marginBottom: '20px' }}>Change Password</h2>
          <form onSubmit={handlePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} required placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required placeholder="••••••••" />
            </div>
            {msg   && <p className="success-msg">{msg}</p>}
            {error && <p className="error-msg">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Account Info</h2>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div><div className="text-muted" style={{ fontSize: '13px' }}>Name</div><div style={{ fontWeight: 600 }}>{user?.name}</div></div>
            <div><div className="text-muted" style={{ fontSize: '13px' }}>Email</div><div style={{ fontWeight: 600 }}>{user?.email}</div></div>
            <div><div className="text-muted" style={{ fontSize: '13px' }}>Currency</div><div style={{ fontWeight: 600 }}>{user?.currency || 'USD'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}