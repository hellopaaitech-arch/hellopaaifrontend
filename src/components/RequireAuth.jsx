import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getRole(me) {
  if (!me) return null;
  if (me.subjectType === 'admin') return me.subject?.role;
  if (me.subjectType === 'client') return 'client';
  if (me.subjectType === 'user') return 'user';
  return null;
}

export function RequireAuth({ allowSubjectTypes, allowRoles }) {
  const { loading, me, accessToken } = useAuth();

  if (loading) return <div className="center">Loading...</div>;
  if (!accessToken || !me) return <Navigate to="/" replace />;

  if (allowSubjectTypes && !allowSubjectTypes.includes(me.subjectType)) {
    return <Navigate to="/" replace />;
  }
  if (allowRoles && !allowRoles.includes(getRole(me))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

