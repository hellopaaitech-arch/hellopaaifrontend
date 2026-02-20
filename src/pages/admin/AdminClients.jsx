import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function AdminClients() {
  const { setToken, loading } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadClients = () => {
    api
      .get('/admin/clients')
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
      await api.patch(`/admin/clients/${id}/approve`);
      loadClients();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to approve');
    }
  }

  async function updateClient(e) {
    e.preventDefault();
    if (!editClient) return;
    setError(null);
    setBusy(true);
    try {
      await api.patch(`/admin/clients/${editClient._id}`, {
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
        ...(editClient.logoUrl ? { logoUrl: editClient.logoUrl } : {})
      });
      setEditClient(null);
      loadClients();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function loginAsClient(id) {
    const r = await api.post('/impersonate', { targetType: 'client', targetId: id });
    setToken(r.data.accessToken, 'client');
    window.open('/client/dashboard', '_blank');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="h">Clients</div>
        <button className="btn sm" onClick={() => navigate('/admin/create-client')}>
          + Add Client
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}

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
        <div className="tr th" style={{ gridTemplateColumns: '1fr 1.6fr 1fr 0.7fr 1fr' }}>
          <div>Client ID</div>
          <div>Email</div>
          <div>Business</div>
          <div>Approved</div>
          <div>Action</div>
        </div>
        {clients.map((c) => (
          <div className="tr" style={{ gridTemplateColumns: '1fr 1.6fr 1fr 0.7fr 1fr' }} key={c._id}>
            <div>{c.clientId}</div>
            <div>{c.email}</div>
            <div>{c.businessName || '-'}</div>
            <div>{String(!!c.loginApproved)}</div>
            <div className="row" style={{ margin: 0, gap: 8 }}>
              {!c.loginApproved ? (
                <button className="btn sm" onClick={() => approveClient(c._id)}>Approve</button>
              ) : null}
              <button className="btn sm" onClick={() => setEditClient({ ...c, logoUrl: c.businessLogo })}>Edit</button>
              <button className="btn sm" onClick={() => loginAsClient(c._id)}>Login as</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

