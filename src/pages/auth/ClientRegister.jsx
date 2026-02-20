import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function ClientRegister() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
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
      await api.post('/auth/client/register', {
        email,
        password,
        emailVerifiedToken,
        businessName,
        fullName,
        mobileNumber,
        logoUrl
      });
      nav('/client/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page center">
      <form className="card wide" onSubmit={onSubmit}>
        <div className="h">Client Register</div>
        <div className="muted">Await approval from Admin or Super Admin before login.</div>

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

        <div className="grid2">
          <label className="field">
            <div className="label">Business Name</div>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">Owner Name</div>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <div className="label">Mobile</div>
          <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
        </label>

        <label className="field">
          <div className="label">Business Logo (Optional)</div>
          <LogoUpload value={logoUrl} onChange={setLogoUrl} folder="clients" />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <button className="btn" type="submit" disabled={busy || !emailVerifiedToken}>
          {busy ? 'Creating…' : 'Register'}
        </button>

        <div className="muted small">
          <Link to="/client/login">Login</Link> · <Link to="/">Back</Link>
        </div>
      </form>
    </div>
  );
}
