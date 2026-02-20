import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function UserProfile() {
  const { me, refresh } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gowthra, setGowthra] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = me?.subject;
    if (s) {
      setName(s.profile?.name || '');
      setMobile(s.mobile || '');
      setDob(s.profile?.dob ? s.profile.dob.slice(0, 10) : '');
      setTimeOfBirth(s.profile?.timeOfBirth || '');
      setPlaceOfBirth(s.profile?.placeOfBirth || '');
      setGowthra(s.profile?.gowthra || '');
      setNativeLanguage(s.profile?.nativeLanguage || '');
      setLogoUrl(s.profileImage || null);
      setFormattedAddress(s.liveLocation?.formattedAddress || '');
      setCity(s.liveLocation?.city || '');
      setState(s.liveLocation?.state || '');
      setCountry(s.liveLocation?.country || '');
    }
  }, [me]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      await api.patch('/auth/me', {
        name,
        mobile,
        password: password || undefined,
        dob: dob || undefined,
        timeOfBirth,
        placeOfBirth,
        gowthra,
        nativeLanguage,
        logoUrl,
        liveLocation: { formattedAddress, city, state, country }
      });
      setMsg('Profile updated');
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="h">User Profile</div>
      <form className="card wide" onSubmit={onSubmit}>
        <div className="form-section">
          <div className="section-title">Profile Image / Logo</div>
          <LogoUpload value={logoUrl} onChange={setLogoUrl} folder="users" />
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
            <div className="label">Native Language</div>
            <input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} placeholder="e.g. Telugu" />
          </label>
        </div>
        <label className="field">
          <div className="label">New Password (leave blank to keep)</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Optional" />
        </label>
        <div className="section-title" style={{ marginTop: 16 }}>Location</div>
        <label className="field">
          <div className="label">Address</div>
          <input value={formattedAddress} onChange={(e) => setFormattedAddress(e.target.value)} placeholder="Formatted address" />
        </label>
        <div className="grid2">
          <label className="field">
            <div className="label">City</div>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">State</div>
            <input value={state} onChange={(e) => setState(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <div className="label">Country</div>
          <input value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        {error ? <div className="error">{error}</div> : null}
        {msg ? <div className="success">{msg}</div> : null}
        <button className="btn" disabled={busy}>Update</button>
      </form>
    </div>
  );
}
