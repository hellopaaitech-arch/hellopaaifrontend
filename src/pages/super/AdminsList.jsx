import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function AdminsList() {
  const { setToken, loading } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAdmins = () => {
    api
      .get('/super-admin/admins')
      .then((r) => setAdmins(r.data.admins || []))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load'));
  };

  useEffect(() => {
    if (!loading) {
      loadAdmins();
    }
  }, [loading]);

  async function approveAdmin(id) {
    try {
      await api.patch(`/super-admin/admins/${id}/approve`);
      loadAdmins();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to approve');
    }
  }

  async function createAdmin(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/admin/create', { email, password });
      setMsg(`Created admin: ${r.data.admin.email}`);
      setEmail('');
      setPassword('');
      setShowAddForm(false);
      loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function updateAdmin(e) {
    e.preventDefault();
    if (!editAdmin) return;
    setError(null);
    setBusy(true);
    try {
      await api.patch(`/super-admin/admins/${editAdmin._id}`, {
        email: editAdmin.email,
        ...(password ? { password } : {})
      });
      setMsg('Admin updated');
      setEditAdmin(null);
      setPassword('');
      loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function loginAs(targetType, targetId, targetRole) {
    const r = await api.post('/impersonate', { targetType, targetId });
    const role = targetRole || 'admin';
    setToken(r.data.accessToken, role);
    const path = role === 'super_admin' ? '/super-admin/dashboard' : '/admin/dashboard';
    window.open(path, '_blank');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="h">Admins</div>
        <button className="btn sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Admin'}
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {msg ? <div className="success">{msg}</div> : null}

      {showAddForm && (
        <form className="card" onSubmit={createAdmin} style={{ marginBottom: 20 }}>
          <div className="section-title">Create New Admin</div>
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
          <button className="btn" disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create Admin'}
          </button>
        </form>
      )}

      {editAdmin && (
        <div className="modal-overlay" onClick={() => setEditAdmin(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="h">Edit Admin</div>
              <button type="button" className="btn sm ghost" onClick={() => setEditAdmin(null)}>×</button>
            </div>
            <form onSubmit={updateAdmin} className="card" style={{ margin: 0, boxShadow: 'none', border: 0 }}>
              <label className="field">
                <div className="label">Email</div>
                <input value={editAdmin.email} onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })} type="email" required />
              </label>
              <label className="field">
                <div className="label">New Password (leave blank to keep)</div>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Optional" />
              </label>
              <div className="modal-footer" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <button type="button" className="btn ghost" onClick={() => setEditAdmin(null)}>Cancel</button>
                <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table">
        <div className="tr th" style={{ gridTemplateColumns: '1.6fr 0.8fr 0.7fr 0.6fr 1.4fr' }}>
          <div>Email</div>
          <div>Role</div>
          <div>Approved</div>
          <div>Active</div>
          <div>Action</div>
        </div>
        {admins.map((a) => (
          <div className="tr" key={a._id} style={{ gridTemplateColumns: '1.6fr 0.8fr 0.7fr 0.6fr 1.4fr' }}>
            <div>{a.email}</div>
            <div>{a.role}</div>
            <div>{String(!!a.loginApproved)}</div>
            <div>{String(!!a.isActive)}</div>
            <div className="row" style={{ margin: 0, gap: 8 }}>
              {!a.loginApproved && a.role === 'admin' ? (
                <button className="btn sm" onClick={() => approveAdmin(a._id)}>Approve</button>
              ) : null}
              <button className="btn sm" onClick={() => setEditAdmin({ ...a })}>Edit</button>
              <button className="btn sm" onClick={() => loginAs('admin', a._id, a.role)}>Login as</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

