const BASE = typeof window === 'undefined'
  ? (process.env.API_URL ?? 'http://localhost:3001')
  : '';

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return;
  }

  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null;

  if (!res.ok) throw new Error(data?.message ?? res.statusText);
  return data;
}

export const api = {
  get: (path: string, opts?: RequestInit) => request(path, { method: 'GET', ...opts }),
  post: (path: string, body: unknown, opts?: RequestInit) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: (path: string, body: unknown, opts?: RequestInit) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (path: string, opts?: RequestInit) => request(path, { method: 'DELETE', ...opts }),
};
