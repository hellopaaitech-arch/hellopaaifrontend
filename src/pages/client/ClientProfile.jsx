import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function ClientProfile() {
  const { me, refresh } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = me?.subject;
    if (s) {
      setBusinessName(s.businessName || '');
      setFullName(s.fullName || '');
      setMobileNumber(s.mobileNumber || '');
      setWebsiteUrl(s.websiteUrl || '');
      setAddress(s.address || '');
      setCity(s.city || '');
      setPincode(s.pincode || '');
      setLogoUrl(s.businessLogo || null);
    }
  }, [me]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      await api.patch('/auth/me', {
        businessName,
        fullName,
        mobileNumber,
        websiteUrl,
        address,
        city,
        pincode,
        logoUrl
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
      <div className="h">Client Profile</div>
      <form className="card wide" onSubmit={onSubmit}>
        <div className="form-section">
          <div className="section-title">Business Logo</div>
          <LogoUpload value={logoUrl} onChange={setLogoUrl} folder="clients" />
        </div>
        <div className="form-section">
          <div className="section-title">Business Information</div>
          <label className="field">
            <div className="label">Business Name</div>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">Owner Name</div>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">Website URL</div>
            <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} type="url" />
          </label>
        </div>
        <div className="form-section">
          <div className="section-title">Contact</div>
          <label className="field">
            <div className="label">Mobile Number</div>
            <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
          </label>
        </div>
        <div className="form-section">
          <div className="section-title">Address</div>
          <label className="field">
            <div className="label">Address</div>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <div className="grid2">
            <label className="field">
              <div className="label">City</div>
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label className="field">
              <div className="label">Pincode</div>
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </label>
          </div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        {msg ? <div className="success">{msg}</div> : null}
        <button className="btn" disabled={busy}>Update</button>
      </form>
    </div>
  );
}
