import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMsg('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMsg(data.message);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Forgot Password 🔐</h1>
        <p>Enter your email and we'll send you a reset link</p>

        {sent
          ? <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <p style={{ color: '#15803d', fontWeight: 600, marginBottom: '8px' }}>Email sent!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Check your inbox at <strong>{email}</strong> for the reset link. It expires in 1 hour.
              </p>
              <Link to="/login" style={{ color: 'var(--green)' }}>← Back to login</Link>
            </div>
          : <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {msg   && <p className="success-msg">{msg}</p>}
              {error && <p className="error-msg">{error}</p>}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="mt-4 text-muted" style={{ fontSize: '14px', textAlign: 'center' }}>
                Remember your password? <Link to="/login" style={{ color: 'var(--green)' }}>Sign in</Link>
              </p>
            </form>
        }
      </div>
    </div>
  );
}