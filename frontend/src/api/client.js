// One place for all backend calls. Errors carry the server's code and message so screens can show them.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Request failed');
    this.status = status; this.code = body?.code; this.details = body?.details;
  }
}
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, { method, credentials: 'include', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && ['SESSION_REVOKED', 'SESSION_EXPIRED', 'ACCOUNT_OFF'].includes(data.code) && onUnauthorized) onUnauthorized(data);
    throw new ApiError(res.status, data);
  }
  return data;
}
export const api = { get: (p) => request('GET', p), post: (p, b) => request('POST', p, b ?? {}), patch: (p, b) => request('PATCH', p, b ?? {}), put: (p, b) => request('PUT', p, b ?? {}), del: (p) => request('DELETE', p) };
