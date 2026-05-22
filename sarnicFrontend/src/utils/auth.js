import { ROLES } from "./roles";

const STORAGE_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  ROLE: "role",
  USER: "user",
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role_name || localStorage.getItem(STORAGE_KEYS.ROLE) || null;
};

export const setAuthSession = ({ token, refreshToken, role, user }) => {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (role) localStorage.setItem(STORAGE_KEYS.ROLE, role);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER);
};


export const isAuthenticated = () => Boolean(getStoredUser());

export const hasRole = (role) => getUserRole() === role;

export const hasAnyRole = (roles = []) => {
  const current = getUserRole();
  return roles.includes(current);
};

/** Role-based home route after login or unauthorized redirect */
export const getDashboardPathByRole = (role) => {
  switch (role) {
    case ROLES.SUPERADMIN:
      return "/superadmin";
    case ROLES.ADMIN:
      return "/admin/dashboard";
    case ROLES.PRODUCTION:
      return "/production/dashboard";
    case ROLES.EMPLOYEE:
      return "/designer/dashboard";
    case ROLES.CLIENT:
      return "/client/dashboard";
    default:
      return "/";
  }
};

export const isSuperAdminRoute = (pathname) =>
  pathname.startsWith("/superadmin");

export const getStoredCompanyId = () => {
  const user = getStoredUser();
  return user?.company_id ?? null;
};

export const getTenantContext = () => {
  const user = getStoredUser();
  const role = getUserRole();
  return {
    companyId: user?.company_id ?? null,
    role,
    isIsolated: role !== ROLES.SUPERADMIN,
  };
};
