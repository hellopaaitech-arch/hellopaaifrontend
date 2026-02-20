import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken } from '../../lib/tokenStore';

function AdminLoginForm({ requireRole }) {
  const { setToken, refresh } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const role = requireRole || 'admin';
    const token = getAccessToken(role);
    if (!token) {
      setChecking(false);
      return;
    }
    api
      .get('/auth/me', { _checkRole: role })
      .then((r) => {
        const gotRole = r.data?.subjectType === 'admin' ? r.data?.subject?.role : r.data?.subjectType;
        if (gotRole === role) {
          nav(role === 'super_admin' ? '/super-admin/dashboard' : '/admin/dashboard', { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [requireRole, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/admin/login', { email, password });
      const role = r.data?.admin?.role || 'admin';
      if (requireRole && role !== requireRole) {
        setError(`This page is only for ${requireRole}.`);
        return;
      }
      setToken(r.data.accessToken, role);
      await refresh();
      if (role === 'super_admin') nav('/super-admin/dashboard');
      else nav('/admin/dashboard');
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
        <div className="h">{requireRole === 'super_admin' ? 'Super Admin Login' : 'Admin Login'}</div>
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

export function SuperAdminLogin() {
  return <AdminLoginForm requireRole="super_admin" />;
}

export function AdminLogin() {
  return <AdminLoginForm requireRole="admin" />;
}

