import { api } from './api';

export async function getMe() {
  try {
    const data = await api.get('/api/auth/me');
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function sendOtp(phone: string) {
  return api.post('/api/auth/send-otp', { phone });
}

export function verifyOtp(phone: string, otp: string) {
  return api.post('/api/auth/verify-otp', { phone, otp });
}

export async function logout() {
  await api.post('/api/auth/logout', {});
  window.location.href = '/login';
}
