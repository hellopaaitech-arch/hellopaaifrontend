import { useState } from 'react';
import { api } from '../../lib/api';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function CreateClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [contactNumber, setContactNumber] = useState('');
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
      const r = await api.post('/auth/client/create', {
        email,
        password,
        businessName,
        fullName,
        mobileNumber,
        websiteUrl,
        gstNumber,
        panNumber,
        address,
        city,
        pincode,
        businessType,
        contactNumber,
        logoUrl
      });
      setMsg(`Created client ${r.data.client.clientId} (${r.data.client.email})`);
      setEmail('');
      setPassword('');
      setBusinessName('');
      setFullName('');
      setMobileNumber('');
      setWebsiteUrl('');
      setGstNumber('');
      setPanNumber('');
      setAddress('');
      setCity('');
      setPincode('');
      setBusinessType('');
      setContactNumber('');
      setLogoUrl(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="h">Create Client</div>
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
          <div className="section-title">Business Information</div>
          <div className="grid2">
            <label className="field">
              <div className="label">Business Name</div>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </label>
            <label className="field">
              <div className="label">Business Type</div>
              <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
            </label>
          </div>
          <div className="grid2">
            <label className="field">
              <div className="label">Website URL</div>
              <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} type="url" />
            </label>
            <label className="field">
              <div className="label">GST Number</div>
              <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <div className="label">PAN Number</div>
            <input value={panNumber} onChange={(e) => setPanNumber(e.target.value)} />
          </label>
        </div>

        <div className="form-section">
          <div className="section-title">Business Logo</div>
          <label className="field">
            <div className="label">Logo (Optional)</div>
            <LogoUpload value={logoUrl} onChange={setLogoUrl} folder="clients" />
          </label>
        </div>

        <div className="form-section">
          <div className="section-title">Contact Information</div>
          <div className="grid2">
            <label className="field">
              <div className="label">Owner Name</div>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="field">
              <div className="label">Mobile Number</div>
              <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <div className="label">Contact Number</div>
            <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
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

        <button className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create Client'}
        </button>
      </form>
    </div>
  );
}

