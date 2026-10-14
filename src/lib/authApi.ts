import { apiRequest, setToken, USER_KEY } from './api';
import type { AdminUser } from '../context/AuthContext';

interface AuthResponse {
  success: boolean;
  token?: string;
  user: AdminUser & { id?: number; createdAt?: string; updatedAt?: string };
  message?: string;
}

function mapUser(user: AuthResponse['user']): AdminUser {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    initials: user.initials,
  };
}

export async function loginRequest(email: string, password: string): Promise<AdminUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });

  if (!data.token) throw new Error('No token returned from server');
  setToken(data.token);
  const user = mapUser(data.user);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem('biopepti_admin_auth', 'true');
  return user;
}

export async function fetchMe(): Promise<AdminUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/me');
  const user = mapUser(data.user);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateProfileRequest(updates: {
  name: string;
  email: string;
  role?: string;
}): Promise<AdminUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/profile', {
    method: 'PUT',
    body: updates,
  });
  const user = mapUser(data.user);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearAuthSession() {
  setToken(null);
  localStorage.removeItem(USER_KEY);
  localStorage.setItem('biopepti_admin_auth', 'false');
}
