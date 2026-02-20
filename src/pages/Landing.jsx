import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Landing() {
  const { me, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    // Only redirect if user is logged in AND on a role-specific route (not root "/")
    const pathname = window.location.pathname;
    if (loading || !me || pathname === '/') return;
    
    // If on a role route but not authenticated, stay on landing
    if (pathname.startsWith('/super-admin/') || 
        pathname.startsWith('/admin/') || 
        pathname.startsWith('/client/') || 
        pathname.startsWith('/user/')) {
      const role = me.subjectType === 'admin' ? me.subject?.role : me.subjectType;
      if (role === 'super_admin') nav('/super-admin/dashboard', { replace: true });
      else if (role === 'admin') nav('/admin/dashboard', { replace: true });
      else if (role === 'client') nav('/client/dashboard', { replace: true });
      else if (role === 'user') nav('/user/dashboard', { replace: true });
    }
  }, [me, loading, nav]);

  if (loading) return <div className="page center">Loading…</div>;

  return (
    <div className="page center">
      <div className="card wide">
        <div className="h">Hello Paai</div>
        <div className="muted">Choose a role to login or register.</div>

        <div className="grid4">
          <div className="role">
            <div className="role-title">Super Admin</div>
            <div className="role-actions">
              <Link className="btn" to="/super-admin/login">
                Login
              </Link>
              <div className="muted small">Credentials in .env</div>
            </div>
          </div>

          <div className="role">
            <div className="role-title">Admin</div>
            <div className="role-actions">
              <Link className="btn" to="/admin/login">
                Login
              </Link>
              <Link className="btn ghost" to="/admin/register">
                Register
              </Link>
            </div>
          </div>

          <div className="role">
            <div className="role-title">Client</div>
            <div className="role-actions">
              <Link className="btn" to="/client/login">
                Login
              </Link>
              <Link className="btn ghost" to="/client/register">
                Register
              </Link>
            </div>
          </div>

          <div className="role">
            <div className="role-title">User</div>
            <div className="role-actions">
              <Link className="btn" to="/user/login">
                Login
              </Link>
              <Link className="btn ghost" to="/user/register">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

