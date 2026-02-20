import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export function AdminRegister() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerifiedToken, setEmailVerifiedToken] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function requestOtp() {
    setError(null);
    if (!email) {
      setError('Email is required');
      return;
    }
    try {
      const r = await api.post('/otp/request', { type: 'email', email: email.trim().toLowerCase() });
      setDevOtp(r.data.devOtp || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP');
    }
  }

  async function verifyOtp() {
    setError(null);
    if (!email) {
      setError('Email is required');
      return;
    }
    const otp = emailOtp.trim();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    try {
      const r = await api.post('/otp/verify', { type: 'email', email: email.trim().toLowerCase(), otp });
      setEmailVerifiedToken(r.data.verifiedToken);
    } catch (err) {
      setError(err?.response?.data?.message || 'OTP verification failed');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post('/auth/admin/register', {
        email,
        password,
        emailVerifiedToken
      });
      nav('/admin/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page center">
      <form className="card wide" onSubmit={onSubmit}>
        <div className="h">Admin Register</div>
        <div className="muted">Await approval from Super Admin before login.</div>

        <label className="field">
          <div className="label">Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <div className="row">
          <button type="button" className="btn ghost" onClick={requestOtp} disabled={!email || !!emailVerifiedToken}>
            Send Email OTP
          </button>
          {devOtp ? <span className="pill">dev OTP: {devOtp}</span> : null}
        </div>

        <div className="grid2">
          <label className="field">
            <div className="label">Email OTP</div>
            <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="6 digits" />
          </label>
          <button type="button" className="btn" onClick={verifyOtp} disabled={!!emailVerifiedToken || !emailOtp}>
            {emailVerifiedToken ? 'Verified' : 'Verify OTP'}
          </button>
        </div>

        <label className="field">
          <div className="label">Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <button className="btn" type="submit" disabled={busy || !emailVerifiedToken}>
          {busy ? 'Creating…' : 'Register'}
        </button>

        <div className="muted small">
          <Link to="/admin/login">Login</Link> · <Link to="/">Back</Link>
        </div>
      </form>
    </div>
  );
}
