import { api } from './api';

export async function getMe() {
  try {
    const data = await api.get('/api/auth/me');
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function login(email: string, password: string) {
  return api.post('/api/auth/login', { email, password });
}

export function register(name: string, email: string, password: string) {
  return api.post('/api/auth/register', { name, email, password });
}

export async function logout() {
  await api.post('/api/auth/logout', {});
  window.location.href = '/login';
}
