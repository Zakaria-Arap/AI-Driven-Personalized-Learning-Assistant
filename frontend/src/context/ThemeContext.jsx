import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { settingsApi } from '../api/endpoints.js';
import { useAuth } from './AuthContext.jsx';

const DEFAULT = { name: 'Somo', tagline: '', logoUrl: null, primaryColor: '#17463A', accentColor: '#F2B23A', defaultMode: 'light', radius: 'soft', fontStyle: 'classic', footerText: '', supportEmail: '', googleClientId: '' };
const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const PRESETS = [
  { id: 'chalkboard', name: 'Chalkboard', primaryColor: '#17463A', accentColor: '#F2B23A' },
  { id: 'ocean', name: 'Ocean', primaryColor: '#1D4ED8', accentColor: '#F59E0B' },
  { id: 'royal', name: 'Royal', primaryColor: '#5B21B6', accentColor: '#F472B6' },
  { id: 'sunset', name: 'Sunset', primaryColor: '#B4381F', accentColor: '#FBBF24' },
  { id: 'savanna', name: 'Savanna', primaryColor: '#7A4A12', accentColor: '#84CC16' },
  { id: 'slate', name: 'Slate', primaryColor: '#334155', accentColor: '#22D3EE' },
];

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState(DEFAULT);
  const [preview, setPreview] = useState(null);
  const [system, setSystem] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const reload = useCallback(() => settingsApi.public().then((r) => setBranding({ ...DEFAULT, ...r.settings })).catch(() => {}), []);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { const mq = window.matchMedia?.('(prefers-color-scheme: dark)'); if (!mq) return; const f = (e) => setSystem(e.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, []);

  const active = preview ? { ...branding, ...preview } : branding;
  const prefs = user?.prefs || {};
  const pref = prefs.theme || 'system';
  const mode = pref === 'system' ? active.defaultMode : pref;
  const dark = mode === 'dark' || (mode === 'system' && system);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--brand', active.primaryColor);
    r.style.setProperty('--accent', active.accentColor);
    r.dataset.theme = dark ? 'dark' : 'light';
    r.dataset.radius = active.radius;
    r.dataset.font = active.fontStyle;
    r.dataset.density = prefs.density || 'comfortable';
    r.dataset.motion = prefs.reducedMotion ? 'reduced' : 'full';
    r.style.fontSize = `${prefs.fontScale || 100}%`;
    document.title = `${active.name} - Learning Assistant`;
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', active.primaryColor);
  }, [active, dark, prefs.density, prefs.reducedMotion, prefs.fontScale]);

  const value = useMemo(() => ({ branding: active, saved: branding, dark, reload, preview: setPreview, hasPreview: !!preview }), [active, branding, dark, reload, preview]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
