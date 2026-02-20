function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

function getCookieNameForRole(role) {
  if (role === 'super_admin') return 'super_admin_token';
  if (role === 'admin') return 'admin_token';
  if (role === 'client') return 'client_token';
  if (role === 'user') return 'user_token';
  return null;
}

export function getAccessToken(role) {
  if (role) {
    const cookieName = getCookieNameForRole(role);
    return cookieName ? getCookie(cookieName) : null;
  }
  // When no role specified, prioritize based on current route
  const pathname = window.location.pathname;
  let prioritizedToken = null;
  
  if (pathname.startsWith('/super-admin/')) {
    prioritizedToken = getCookie('super_admin_token');
  } else if (pathname.startsWith('/admin/')) {
    prioritizedToken = getCookie('admin_token');
  } else if (pathname.startsWith('/client/')) {
    prioritizedToken = getCookie('client_token');
  } else if (pathname.startsWith('/user/')) {
    prioritizedToken = getCookie('user_token');
  }
  
  // If we found a token matching the route, use it
  if (prioritizedToken) {
    return prioritizedToken;
  }
  
  // Otherwise, try all roles (fallback)
  return (
    getCookie('super_admin_token') ||
    getCookie('admin_token') ||
    getCookie('client_token') ||
    getCookie('user_token') ||
    null
  );
}

export function setAccessToken(token, role) {
  if (!token || !role) {
    // Clear all tokens only when explicitly logging out
    deleteCookie('super_admin_token');
    deleteCookie('admin_token');
    deleteCookie('client_token');
    deleteCookie('user_token');
    return;
  }
  const cookieName = getCookieNameForRole(role);
  if (cookieName) {
    // Only set this role's token - keep others (don't clear)
    setCookie(cookieName, token);
  }
}

export function clearAllTokens() {
  deleteCookie('super_admin_token');
  deleteCookie('admin_token');
  deleteCookie('client_token');
  deleteCookie('user_token');
}

/** Clear only the token for a specific role (for role-specific logout) */
export function clearTokenForRole(role) {
  const name = getCookieNameForRole(role);
  if (name) deleteCookie(name);
}

