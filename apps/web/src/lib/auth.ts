import { api } from './api';

export async function getMe() {
  try {
    const data = await api.get('/auth/me');
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function login(email: string, password: string) {
  return api.post('/auth/login', { email, password });
}

export function register(name: string, email: string, password: string) {
  return api.post('/auth/register', { name, email, password });
}

export async function logout() {
  await api.post('/auth/logout', {});
  window.location.href = '/login';
}
