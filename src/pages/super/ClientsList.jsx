import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function SuperClientsList() {
  const { setToken, loading } = useAuth();
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    fullName: '',
    mobileNumber: '',
    websiteUrl: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: '',
    pincode: '',
    businessType: '',
    contactNumber: '',
    logoUrl: null
  });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const loadClients = () => {
    api
      .get('/super-admin/clients')
      .then((r) => setClients(r.data.clients || []))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load'));
  };

  useEffect(() => {
    if (!loading) {
      loadClients();
    }
  }, [loading]);

  async function approveClient(id) {
    try {
      await api.patch(`/super-admin/clients/${id}/approve`);
      loadClients();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to approve');
    }
  }

  async function createClient(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const payload = { ...formData };
      if (formData.logoUrl) payload.logoUrl = formData.logoUrl;
      const r = await api.post('/auth/client/create', payload);
      setMsg(`Created client ${r.data.client.clientId} (${r.data.client.email})`);
      setFormData({
        email: '',
        password: '',
        businessName: '',
        fullName: '',
        mobileNumber: '',
        websiteUrl: '',
        gstNumber: '',
        panNumber: '',
        address: '',
        city: '',
        pincode: '',
        businessType: '',
        contactNumber: '',
        logoUrl: null
      });
      setShowAddForm(false);
      loadClients();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function updateClient(e) {
    e.preventDefault();
    if (!editClient) return;
    setError(null);
    setBusy(true);
    try {
      const payload = {
        email: editClient.email,
        businessName: editClient.businessName,
        fullName: editClient.fullName,
        mobileNumber: editClient.mobileNumber,
        websiteUrl: editClient.websiteUrl,
        gstNumber: editClient.gstNumber,
        panNumber: editClient.panNumber,
        address: editClient.address,
        city: editClient.city,
        pincode: editClient.pincode,
        businessType: editClient.businessType,
        contactNumber: editClient.contactNumber,
        loginApproved: editClient.loginApproved,
        isActive: editClient.isActive
      };
      if (editClient.logoUrl) payload.logoUrl = editClient.logoUrl;
      await api.patch(`/super-admin/clients/${editClient._id}`, payload);
      setMsg('Client updated');
      setEditClient(null);
      loadClients();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function loginAs(targetId) {
    const r = await api.post('/impersonate', { targetType: 'client', targetId });
    setToken(r.data.accessToken, 'client');
    window.open('/client/dashboard', '_blank');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="h">Clients</div>
        <button className="btn sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Client'}
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {msg ? <div className="success">{msg}</div> : null}

      {showAddForm && (
        <form className="card wide" onSubmit={createClient} style={{ marginBottom: 20 }}>
          <div className="section-title">Create New Client</div>
          <div className="form-section">
            <div className="section-title">Login Credentials</div>
            <div className="grid2">
              <label className="field">
                <div className="label">Email *</div>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email"
                  required
                />
              </label>
              <label className="field">
                <div className="label">Password *</div>
                <input
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type="password"
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">Business Information</div>
            <div className="grid2">
              <label className="field">
                <div className="label">Business Name</div>
                <input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </label>
              <label className="field">
                <div className="label">Business Type</div>
                <input
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                />
              </label>
            </div>
            <div className="grid2">
              <label className="field">
                <div className="label">Website URL</div>
                <input
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  type="url"
                />
              </label>
              <label className="field">
                <div className="label">GST Number</div>
                <input
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <div className="label">PAN Number</div>
              <input
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
              />
            </label>
          </div>

          <div className="form-section">
            <div className="section-title">Business Logo</div>
            <label className="field">
              <div className="label">Logo (Optional)</div>
              <LogoUpload value={formData.logoUrl} onChange={(v) => setFormData({ ...formData, logoUrl: v })} folder="clients" />
            </label>
          </div>

          <div className="form-section">
            <div className="section-title">Contact Information</div>
            <div className="grid2">
              <label className="field">
                <div className="label">Owner Name</div>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </label>
              <label className="field">
                <div className="label">Mobile Number</div>
                <input
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <div className="label">Contact Number</div>
              <input
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </label>
          </div>

          <div className="form-section">
            <div className="section-title">Address</div>
            <label className="field">
              <div className="label">Address</div>
              <input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </label>
            <div className="grid2">
              <label className="field">
                <div className="label">City</div>
                <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </label>
              <label className="field">
                <div className="label">Pincode</div>
                <input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </label>
            </div>
          </div>

          <button className="btn" disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create Client'}
          </button>
        </form>
      )}

      {editClient && (
        <div className="modal-overlay" onClick={() => setEditClient(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="h">Edit Client</div>
              <button type="button" className="btn sm ghost" onClick={() => setEditClient(null)}>×</button>
            </div>
            <form onSubmit={updateClient} style={{ padding: 20 }}>
              <div className="grid2">
                <label className="field">
                  <div className="label">Email</div>
                  <input value={editClient.email || ''} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} type="email" required />
                </label>
                <label className="field">
                  <div className="label">Business Name</div>
                  <input value={editClient.businessName || ''} onChange={(e) => setEditClient({ ...editClient, businessName: e.target.value })} />
                </label>
              </div>
              <label className="field">
                <div className="label">Logo</div>
                <LogoUpload value={editClient.logoUrl || editClient.businessLogo} onChange={(v) => setEditClient({ ...editClient, logoUrl: v })} folder="clients" />
              </label>
              <div className="modal-footer" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <button type="button" className="btn ghost" onClick={() => setEditClient(null)}>Cancel</button>
                <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table">
        <div className="tr th" style={{ gridTemplateColumns: '1fr 1.6fr 1fr 0.7fr 1.4fr' }}>
          <div>Client ID</div>
          <div>Email</div>
          <div>Business</div>
          <div>Approved</div>
          <div>Action</div>
        </div>
        {clients.map((c) => (
          <div className="tr" key={c._id} style={{ gridTemplateColumns: '1fr 1.6fr 1fr 0.7fr 1.4fr' }}>
            <div>{c.clientId}</div>
            <div>{c.email}</div>
            <div>{c.businessName || '-'}</div>
            <div>{String(!!c.loginApproved)}</div>
            <div className="row" style={{ margin: 0, gap: 8 }}>
              {!c.loginApproved ? (
                <button className="btn sm" onClick={() => approveClient(c._id)}>Approve</button>
              ) : null}
              <button className="btn sm" onClick={() => setEditClient({ ...c, logoUrl: c.businessLogo })}>Edit</button>
              <button className="btn sm" onClick={() => loginAs(c._id)}>Login as</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

