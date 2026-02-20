import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken } from '../../lib/tokenStore';

export function ClientLogin() {
  const { setToken, refresh } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken('client');
    if (!token) {
      setChecking(false);
      return;
    }
    api
      .get('/auth/me', { _checkRole: 'client' })
      .then((r) => {
        if (r.data?.subjectType === 'client') nav('/client/dashboard', { replace: true });
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/client/login', { email, password });
      setToken(r.data.accessToken, 'client');
      await refresh();
      nav('/client/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <div className="page center">Loading…</div>;

  return (
    <div className="page center">
      <form className="card" onSubmit={onSubmit}>
        <div className="h">Client Login</div>
        <div className="muted">Use your email and password.</div>

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

        <div className="muted small">
          <Link to="/">Back</Link>
        </div>
      </form>
    </div>
  );
}

