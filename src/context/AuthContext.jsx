/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { getAccessToken, setAccessToken, clearAllTokens, clearTokenForRole } from '../lib/tokenStore';

const AuthContext = createContext(null);

let refreshPromise = null;

function getRoleFromMe(me) {
  if (!me) return null;
  if (me.subjectType === 'admin') return me.subject?.role || 'admin';
  if (me.subjectType === 'client') return 'client';
  if (me.subjectType === 'user') return 'user';
  return null;
}

async function refreshAccessToken(currentRole) {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((r) => {
        return { token: r.data.accessToken, role: currentRole };
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(getAccessToken());
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null); // Override: which role we're acting as (after Login as)

  const setToken = useCallback((token, role) => {
    if (token && !role) {
      const inferredRole = getRoleFromMe(me);
      setAccessToken(token, inferredRole);
      setActiveRole(inferredRole);
    } else {
      setAccessToken(token, role);
      setActiveRole(role || null);
    }
    setAccessTokenState(token);
  }, [me]);

  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      // Always try to get token from cookies first (most reliable on refresh)
      // config._checkRole: when login page checks if already logged in for that role
      const role = config._checkRole || activeRole || getRoleFromMe(me);
      let token = null;
      
      // Try role-specific token first if we have a role
      if (role) {
        token = getAccessToken(role);
      }
      
      // If no token found with role, try pathname-based lookup (handles refresh scenarios)
      if (!token) {
        token = getAccessToken();
      }
      
      // Always set token if found, regardless of state
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Update state if it's different (helps keep state in sync)
        if (token !== accessToken) {
          setAccessTokenState(token);
        }
      }
      
      return config;
    });

    const resId = api.interceptors.response.use(
      (r) => r,
      async (error) => {
        const original = error.config;
        if (!original || original._retry) throw error;
        if (error.response?.status !== 401) throw error;

        original._retry = true;
        try {
          const currentRole = getRoleFromMe(me);
          const { token: newToken, role: newRole } = await refreshAccessToken(currentRole);
          if (newRole) {
            setToken(newToken, newRole);
          } else {
            setToken(newToken);
          }
          original.headers.Authorization = `Bearer ${newToken}`;
          return api.request(original);
        } catch (e) {
          setToken(null, null);
          throw e;
        }
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [setToken, activeRole, me, accessToken]);

  const loadMe = useCallback(
    async (forceRole) => {
      // forceRole: pass when "Login as" - state hasn't updated yet so we need to use the new role
      const role = forceRole || activeRole || getRoleFromMe(me);
      const token = (role ? getAccessToken(role) : null) || getAccessToken();
      if (!token) {
        setMe(null);
        setActiveRole(null);
        setAccessTokenState(null);
        setLoading(false);
        return;
      }
      try {
        const r = await api.get('/auth/me', forceRole ? { _checkRole: forceRole } : {});
        const newRole = getRoleFromMe(r.data);
        setMe(r.data);
        setActiveRole(newRole);
        setAccessTokenState(token); // Ensure state is updated
        if (newRole) {
          const roleToken = getAccessToken(newRole);
          if (roleToken !== token) {
            setAccessToken(token, newRole);
          }
        }
      } catch {
        setMe(null);
        setToken(null, null);
        setActiveRole(null);
      } finally {
        setLoading(false);
      }
    },
    [setToken, activeRole, me]
  );

  useEffect(() => {
    // Derive role from pathname for initial load (fixes refresh - ensures right token)
    const path = window.location.pathname;
    let forceRole = null;
    if (path.startsWith('/super-admin/')) forceRole = 'super_admin';
    else if (path.startsWith('/admin/')) forceRole = 'admin';
    else if (path.startsWith('/client/')) forceRole = 'client';
    else if (path.startsWith('/user/')) forceRole = 'user';
    loadMe(forceRole);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(() => {
    const role = activeRole || getRoleFromMe(me) || (() => {
      const p = window.location.pathname;
      if (p.startsWith('/super-admin/')) return 'super_admin';
      if (p.startsWith('/admin/')) return 'admin';
      if (p.startsWith('/client/')) return 'client';
      if (p.startsWith('/user/')) return 'user';
      return null;
    })();
    if (role) {
      clearTokenForRole(role);
    } else {
      clearAllTokens();
    }
    setMe(null);
    setActiveRole(null);
    setAccessTokenState(null);
  }, [activeRole, me]);

  const value = useMemo(
    () => ({
      accessToken,
      me,
      loading,
      setToken,
      refresh: loadMe,
      logout
    }),
    [accessToken, me, loading, setToken, loadMe, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

