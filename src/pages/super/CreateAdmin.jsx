import { useState } from 'react';
import { api } from '../../lib/api';

export function CreateAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/admin/create', { email, password });
      setMsg(`Created admin: ${r.data.admin.email}`);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="h">Create Admin</div>
      <form className="card" onSubmit={onSubmit}>
        <label className="field">
          <div className="label">Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="field">
          <div className="label">Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {error ? <div className="error">{error}</div> : null}
        {msg ? <div className="success">{msg}</div> : null}
        <button className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </form>
    </div>
  );
}

