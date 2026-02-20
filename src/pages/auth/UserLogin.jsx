import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken } from '../../lib/tokenStore';

export function UserLogin() {
  const { setToken, refresh } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('password'); // 'password' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken('user');
    if (!token) {
      setChecking(false);
      return;
    }
    api
      .get('/auth/me', { _checkRole: 'user' })
      .then((r) => {
        if (r.data?.subjectType === 'user') nav('/user/dashboard', { replace: true });
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [nav]);

  async function onPasswordLogin(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/user/login', { email, password });
      setToken(r.data.accessToken, 'user');
      await refresh();
      nav('/user/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  async function onEmailSignInRequest() {
    setError(null);
    if (!email) {
      setError('Email is required');
      return;
    }
    setBusy(true);
    try {
      const otpRes = await api.post('/otp/request', { type: 'email', email: email.trim().toLowerCase() });
      setDevOtp(otpRes.data.devOtp || null);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function onEmailSignInVerify(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/user/email-signin/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });
      if (r.data.exists && r.data.accessToken) {
        setToken(r.data.accessToken, 'user');
        await refresh();
        nav('/user/dashboard');
      } else {
        nav('/user/register', { state: { emailVerifiedToken: r.data.verifiedToken, email: email.trim().toLowerCase() } });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <div className="page center">Loading…</div>;

  return (
    <div className="page center">
      <div className="card">
        <div className="h">User Login</div>
        <div className="muted">
          {mode === 'password' ? 'Use email and password.' : 'Sign in with email only (OTP verification).'}
        </div>

        <div className="row" style={{ marginBottom: 16, gap: 8 }}>
          <button
            type="button"
            className={`btn sm ${mode === 'password' ? '' : 'ghost'}`}
            onClick={() => { setMode('password'); setStep(1); setError(null); }}

          >
            Password
          </button>
          <button
            type="button"
            className={`btn sm ${mode === 'email' ? '' : 'ghost'}`}
            onClick={() => { setMode('email'); setStep(1); setError(null); }}

          >
            Email only (AI)
          </button>
        </div>

        {mode === 'password' && (
          <form onSubmit={onPasswordLogin}>
            <label className="field">
              <div className="label">Email</div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label className="field">
              <div className="label">Password</div>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button className="btn" disabled={busy}>
              {busy ? 'Logging in…' : 'Login'}
            </button>
          </form>
        )}

        {mode === 'email' && step === 1 && (
          <>
            <label className="field">
              <div className="label">Email</div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button type="button" className="btn" onClick={onEmailSignInRequest} disabled={busy}>
              {busy ? 'Sending…' : 'Send OTP'}
            </button>
          </>
        )}

        {mode === 'email' && step === 2 && (
          <form onSubmit={onEmailSignInVerify}>
            <div className="muted small">OTP sent to {email}</div>
            {devOtp ? <div className="pill" style={{ marginTop: 8 }}>dev OTP: {devOtp}</div> : null}
            <label className="field">
              <div className="label">Enter OTP</div>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 digits" required />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button className="btn" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify & Sign in'}
            </button>
            <button
              type="button"
              className="btn ghost"
              style={{ marginLeft: 8 }}
              onClick={() => { setStep(1); setOtp(''); setError(null); }}
            >
              Back
            </button>
          </form>
        )}
        <div className="muted small" style={{ marginTop: 16 }}>
          <Link to="/user/register">Register</Link> · <Link to="/">Back</Link>
        </div>
      </div>
    </div>
  );
}
