import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints.js';
import { setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const HOME = { learner: '/learner', teacher: '/teacher', parent: '/parent', principal: '/principal', admin: '/admin' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => { authApi.me().then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  // If this device is signed out from another device, the next request lands here.
  useEffect(() => { setUnauthorizedHandler((d) => { setUser(null); setNotice(d.message); }); }, []);

  const signOut = useCallback(async () => { await authApi.logout().catch(() => {}); setUser(null); }, []);
  const refresh = useCallback(() => authApi.me().then((r) => setUser(r.user)), []);
  return <AuthContext.Provider value={{ user, setUser, loading, signOut, refresh, notice, clearNotice: () => setNotice(null) }}>{children}</AuthContext.Provider>;
}
