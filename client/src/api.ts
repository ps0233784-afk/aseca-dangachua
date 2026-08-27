const TOKEN_KEY = 'aseca_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> || {}),
  };
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch('/api' + path, { ...opts, headers });
  if (res.status === 401 && !path.includes('/auth/login')) {
    setToken(null);
    if (!path.startsWith('/public')) window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : (res.blob() as any);
}

export const get = <T = any>(p: string) => api<T>(p);
export const post = <T = any>(p: string, body?: any) =>
  api<T>(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body || {}) });
export const put = <T = any>(p: string, body?: any) =>
  api<T>(p, { method: 'PUT', body: JSON.stringify(body || {}) });
export const del = <T = any>(p: string) => api<T>(p, { method: 'DELETE' });

export function downloadFile(path: string, filename: string) {
  const token = getToken();
  fetch('/api' + path, { headers: token ? { Authorization: 'Bearer ' + token } : {} })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
}

export async function uploadFile(file: File, type = 'document', title = '') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', type);
  fd.append('title', title || file.name);
  return post<{ url: string }>('/upload', fd);
}
