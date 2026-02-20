import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function AdminProfile() {
  const { me, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me?.subject?.email) setEmail(me.subject.email);
  }, [me]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const payload = { email: email.trim().toLowerCase() };
      if (password) payload.password = password;
      await api.patch('/auth/me', payload);
      setMsg('Profile updated');
      setPassword('');
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="h">Admin Profile</div>
      <form className="card" onSubmit={onSubmit}>
        <label className="field">
          <div className="label">Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="field">
          <div className="label">New Password (leave blank to keep)</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>
        {error ? <div className="error">{error}</div> : null}
        {msg ? <div className="success">{msg}</div> : null}
        <button className="btn" disabled={busy}>Update</button>
      </form>
    </div>
  );
}
