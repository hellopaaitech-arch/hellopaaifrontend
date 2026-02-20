import { useState } from 'react';
import { api } from '../../lib/api';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function ClientCreateUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gowthra, setGowthra] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/user/create', {
        email,
        password,
        mobile,
        name,
        dob: dob || undefined,
        timeOfBirth: timeOfBirth || undefined,
        placeOfBirth: placeOfBirth || undefined,
        gowthra: gowthra || undefined,
        logoUrl
      });
      setMsg(`Created user: ${r.data.user.email}`);
      setEmail('');
      setPassword('');
      setMobile('');
      setName('');
      setDob('');
      setTimeOfBirth('');
      setPlaceOfBirth('');
      setGowthra('');
      setLogoUrl(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="h">Create User</div>
      <form className="card wide" onSubmit={onSubmit}>
        <div className="form-section">
          <div className="section-title">Login Credentials</div>
          <div className="grid2">
            <label className="field">
              <div className="label">Email *</div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label className="field">
              <div className="label">Password *</div>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">Profile Information</div>
          <div className="grid2">
            <label className="field">
              <div className="label">Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <div className="label">Mobile</div>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <div className="label">Date of Birth</div>
            <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
          </label>
          <div className="grid2">
            <label className="field">
              <div className="label">Time of Birth</div>
              <input value={timeOfBirth} onChange={(e) => setTimeOfBirth(e.target.value)} placeholder="HH:MM" />
            </label>
            <label className="field">
              <div className="label">Place of Birth</div>
              <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <div className="label">Gowthra</div>
            <input value={gowthra} onChange={(e) => setGowthra(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">Profile Image / Logo (Optional)</div>
            <LogoUpload value={logoUrl} onChange={setLogoUrl} folder="users" />
          </label>
        </div>

        {error ? <div className="error">{error}</div> : null}
        {msg ? <div className="success">{msg}</div> : null}

        <button className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create User'}
        </button>
      </form>
    </div>
  );
}
