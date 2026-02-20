import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function AdminUsers() {
  const { setToken, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    let alive = true;
    api.get('/admin/users').then((r) => { if (!alive) return; setUsers(r.data.users || []); }).catch((e) => setError(e?.response?.data?.message || 'Failed'));
    api.get('/admin/clients').then((r) => { if (!alive) return; setClients(r.data.clients || []); }).catch(() => {});
    return () => { alive = false; };
  }, [loading]);

  async function updateUser(e) {
    e.preventDefault();
    if (!editUser) return;
    setError(null);
    setBusy(true);
    try {
      await api.patch(`/admin/users/${editUser._id}`, {
        email: editUser.email,
        mobile: editUser.mobile,
        name: editUser.profile?.name,
        clientId: editUser.clientId?._id || editUser.clientId,
        ...(editUser.logoUrl ? { logoUrl: editUser.logoUrl } : {})
      });
      setEditUser(null);
      api.get('/admin/users').then((r) => setUsers(r.data.users || []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function loginAsUser(id) {
    const r = await api.post('/impersonate', { targetType: 'user', targetId: id });
    setToken(r.data.accessToken, 'user');
    window.open('/user/dashboard', '_blank');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="h">Users</div>
        <button className="btn sm" onClick={() => navigate('/admin/create-user')}>
          + Add User
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="h">Edit User</div>
              <button type="button" className="btn sm ghost" onClick={() => setEditUser(null)}>×</button>
            </div>
            <form onSubmit={updateUser} style={{ padding: 20 }}>
              <label className="field">
                <div className="label">Email</div>
                <input value={editUser.email || ''} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} type="email" required />
              </label>
              <label className="field">
                <div className="label">Mobile</div>
                <input value={editUser.mobile || ''} onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })} />
              </label>
              <label className="field">
                <div className="label">Name</div>
                <input value={editUser.profile?.name || ''} onChange={(e) => setEditUser({ ...editUser, profile: { ...editUser.profile, name: e.target.value } })} />
              </label>
              <label className="field">
                <div className="label">Client</div>
                <select value={editUser.clientId?._id || editUser.clientId || ''} onChange={(e) => setEditUser({ ...editUser, clientId: e.target.value })}>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.clientId} - {c.businessName || c.email}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <div className="label">Logo</div>
                <LogoUpload value={editUser.logoUrl || editUser.profileImage} onChange={(v) => setEditUser({ ...editUser, logoUrl: v })} folder="users" />
              </label>
              <div className="modal-footer" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <button type="button" className="btn ghost" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table">
        <div className="tr th" style={{ gridTemplateColumns: '1.6fr 1fr 1fr 0.7fr 1fr' }}>
          <div>Email</div>
          <div>Mobile</div>
          <div>Client</div>
          <div>Approved</div>
          <div>Action</div>
        </div>
        {users.map((u) => (
          <div className="tr" style={{ gridTemplateColumns: '1.6fr 1fr 1fr 0.7fr 1fr' }} key={u._id}>
            <div>{u.email}</div>
            <div>{u.mobile || '-'}</div>
            <div>{u.clientId?.clientId || '-'}</div>
            <div>{String(!!u.loginApproved)}</div>
            <div className="row" style={{ margin: 0, gap: 8 }}>
              <button className="btn sm" onClick={() => setEditUser({ ...u, logoUrl: u.profileImage })}>Edit</button>
              <button className="btn sm" onClick={() => loginAsUser(u._id)}>Login as</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

