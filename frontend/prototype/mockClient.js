// Drop-in replacement for src/api/client.js in the prototype build: same exports, no network.
import { handle, HttpError } from './mock/server.js';
export class ApiError extends Error {
  constructor(status, body) { super(body?.message || 'Request failed'); this.status = status; this.code = body?.code; this.details = body?.details; }
}
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };
const call = (method, path, body) => new Promise((resolve, reject) => setTimeout(() => {
  try { resolve(JSON.parse(JSON.stringify(handle(method, path, body)))); } catch (e) {
    if (e instanceof HttpError) { if (e.status === 401 && ['SESSION_REVOKED', 'SESSION_EXPIRED'].includes(e.body.code) && onUnauthorized) onUnauthorized(e.body); reject(new ApiError(e.status, e.body)); } else { console.error(e); reject(new ApiError(500, { message: 'Prototype error: ' + e.message })); }
  }
}, 120));
export const api = { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b ?? {}), patch: (p, b) => call('PATCH', p, b ?? {}), put: (p, b) => call('PUT', p, b ?? {}), del: (p) => call('DELETE', p) };
