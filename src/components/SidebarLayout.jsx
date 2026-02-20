import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function roleLabel(me) {
  if (!me) return '';
  if (me.subjectType === 'admin') return me.subject?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  if (me.subjectType === 'client') return 'Client';
  return 'User';
}

function linksFor(me) {
  if (!me) return [];
  if (me.subjectType === 'admin' && me.subject?.role === 'super_admin') {
    return [
      { to: '/super-admin/dashboard', label: 'Dashboard' },
      { to: '/super-admin/admins', label: 'Admins' },
      { to: '/super-admin/clients', label: 'Clients' },
      { to: '/super-admin/users', label: 'Users' },
      { to: '/super-admin/create-admin', label: 'Create Admin' },
      { to: '/super-admin/create-client', label: 'Create Client' },
      { to: '/super-admin/create-user', label: 'Create User' },
      { to: '/super-admin/profile', label: 'Profile' }
    ];
  }
  if (me.subjectType === 'admin') {
    return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/clients', label: 'Clients' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/create-client', label: 'Create Client' },
      { to: '/admin/create-user', label: 'Create User' },
      { to: '/admin/profile', label: 'Profile' }
    ];
  }
  if (me.subjectType === 'client') {
    return [
      { to: '/client/dashboard', label: 'Dashboard' },
      { to: '/client/users', label: 'Users' },
      { to: '/client/create-user', label: 'Create User' },
      { to: '/client/profile', label: 'Profile' }
    ];
  }
  return [
    { to: '/user/dashboard', label: 'Dashboard' },
    { to: '/user/profile', label: 'Profile' }
  ];
}

export function SidebarLayout() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();

  const links = linksFor(me);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">hello paai</div>
          <div className="brand-sub">{roleLabel(me)}</div>
        </div>

        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'navlink active' : 'navlink')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn ghost"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

