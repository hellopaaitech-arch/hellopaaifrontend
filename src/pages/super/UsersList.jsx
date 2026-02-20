import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function SuperUsersList() {
  const { setToken, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    name: '',
    dob: '',
    timeOfBirth: '',
    placeOfBirth: '',
    gowthra: '',
    clientId: '',
    logoUrl: null
  });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadUsers = () => {
    api
      .get('/super-admin/users')
      .then((r) => setUsers(r.data.users || []))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load'));
  };

  useEffect(() => {
    if (loading) return;
    loadUsers();
    api
      .get('/super-admin/clients')
      .then((r) => setClients(r.data.clients || []))
      .catch(() => {});
  }, [loading]);

  async function createUser(e) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setBusy(true);
    try {
      const r = await api.post('/auth/user/create', {
        ...formData,
        logoUrl: formData.logoUrl || undefined,
        dob: formData.dob || undefined,
        timeOfBirth: formData.timeOfBirth || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        gowthra: formData.gowthra || undefined
      });
      setMsg(`Created user: ${r.data.user.email}`);
      setFormData({
        email: '',
        password: '',
        mobile: '',
        name: '',
        dob: '',
        timeOfBirth: '',
        placeOfBirth: '',
        gowthra: '',
        clientId: '',
        logoUrl: null
      });
      setShowAddForm(false);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function updateUser(e) {
    e.preventDefault();
    if (!editUser) return;
    setError(null);
    setBusy(true);
    try {
      const payload = {
        email: editUser.email,
        mobile: editUser.mobile,
        name: editUser.profile?.name,
        clientId: editUser.clientId?._id || editUser.clientId,
        dob: editUser.profile?.dob ? new Date(editUser.profile.dob).toISOString().slice(0, 10) : undefined,
        timeOfBirth: editUser.profile?.timeOfBirth,
        placeOfBirth: editUser.profile?.placeOfBirth,
        gowthra: editUser.profile?.gowthra,
        loginApproved: editUser.loginApproved,
        isActive: editUser.isActive
      };
      if (editUser.logoUrl) payload.logoUrl = editUser.logoUrl;
      await api.patch(`/super-admin/users/${editUser._id}`, payload);
      setMsg('User updated');
      setEditUser(null);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function loginAs(targetId) {
    const r = await api.post('/impersonate', { targetType: 'user', targetId });
    setToken(r.data.accessToken, 'user');
    window.open('/user/dashboard', '_blank');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="h">Users</div>
        <button className="btn sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {msg ? <div className="success">{msg}</div> : null}

      {showAddForm && (
        <form className="card wide" onSubmit={createUser} style={{ marginBottom: 20 }}>
          <div className="section-title">Create New User</div>
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
            <div className="section-title">Client Assignment</div>
            <label className="field">
              <div className="label">Client *</div>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.clientId} - {c.businessName || c.email}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-section">
            <div className="section-title">Profile Information</div>
            <div className="grid2">
              <label className="field">
                <div className="label">Name</div>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </label>
              <label className="field">
                <div className="label">Mobile</div>
                <input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <div className="label">Date of Birth</div>
              <input value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} type="date" />
            </label>
            <div className="grid2">
              <label className="field">
                <div className="label">Time of Birth</div>
                <input
                  value={formData.timeOfBirth}
                  onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                  placeholder="HH:MM"
                />
              </label>
              <label className="field">
                <div className="label">Place of Birth</div>
                <input
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <div className="label">Gowthra</div>
              <input
                value={formData.gowthra}
                onChange={(e) => setFormData({ ...formData, gowthra: e.target.value })}
              />
            </label>
            <label className="field">
              <div className="label">Logo (Optional)</div>
              <LogoUpload value={formData.logoUrl} onChange={(v) => setFormData({ ...formData, logoUrl: v })} folder="users" />
            </label>
          </div>

          <button className="btn" disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create User'}
          </button>
        </form>
      )}

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
        <div className="tr th" style={{ gridTemplateColumns: '1.6fr 1fr 1fr 0.7fr 1.2fr' }}>
          <div>Email</div>
          <div>Mobile</div>
          <div>Client</div>
          <div>Approved</div>
          <div>Action</div>
        </div>
        {users.map((u) => (
          <div className="tr" key={u._id} style={{ gridTemplateColumns: '1.6fr 1fr 1fr 0.7fr 1.2fr' }}>
            <div>{u.email}</div>
            <div>{u.mobile || '-'}</div>
            <div>{u.clientId?.clientId || '-'}</div>
            <div>{String(!!u.loginApproved)}</div>
            <div className="row" style={{ margin: 0, gap: 8 }}>
              <button className="btn sm" onClick={() => setEditUser({ ...u, logoUrl: u.profileImage })}>Edit</button>
              <button className="btn sm" onClick={() => loginAs(u._id)}>Login as</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

