import { useAuth } from '../../context/AuthContext';

export function UserDashboard() {
  const { me } = useAuth();
  const u = me?.subject;

  return (
    <div className="page">
      <div className="h">User Dashboard</div>
      <div className="muted">Welcome{u?.profile?.name ? `, ${u.profile.name}` : ''}.</div>

      <div className="card wide">
        <div className="kv">
          <div className="k">Email</div>
          <div className="v">{u?.email || '-'}</div>
        </div>
        <div className="kv">
          <div className="k">Mobile</div>
          <div className="v">{u?.mobile || '-'}</div>
        </div>
        <div className="kv">
          <div className="k">Client</div>
          <div className="v">
            {typeof u?.clientId === 'string' ? u.clientId : u?.clientId?.clientId || '(not loaded)'}
          </div>
        </div>
      </div>
    </div>
  );
}

