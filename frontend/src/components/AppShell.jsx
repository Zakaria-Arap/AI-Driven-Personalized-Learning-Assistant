import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import Avatar from './Avatar.jsx';
import NotificationBell from './NotificationBell.jsx';
import UserMenu from './UserMenu.jsx';
import CommandPalette from './CommandPalette.jsx';
import { NAV, flat } from './navConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useT } from '../context/I18nContext.jsx';
import { profileApi } from '../api/endpoints.js';

export const Brand = ({ branding, size }) => (
  <span className="logo" style={size ? { width: size, height: size } : undefined}>{branding.logoUrl ? <img src={branding.logoUrl} alt="" /> : (branding.name || 'S')[0].toUpperCase()}</span>
);

export default function AppShell() {
  const { user, setUser } = useAuth();
  const { branding, dark } = useTheme();
  const { t, lang } = useT();
  const loc = useLocation();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('somo.collapsed') === '1'; } catch { return false; } });
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => setDrawer(false), [loc.pathname]);
  useEffect(() => { try { localStorage.setItem('somo.collapsed', collapsed ? '1' : '0'); } catch { /* private mode */ } }, [collapsed]);
  useEffect(() => {
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = dark ? 'light' : 'dark';
    setUser((u) => ({ ...u, prefs: { ...u.prefs, theme: next } }));          // instant
    profileApi.update({ prefs: { theme: next } }).catch(() => {});             // saved in the background
  }, [dark, setUser]);

  const current = flat(user.role).find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));
  const title = current ? t(current.label) : branding.name;
  const groups = NAV[user.role] || [];

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${drawer ? 'drawer-open' : ''}`}>
      <aside className="sidebar" aria-label="Main navigation">
        <NavLink to="/" className="brandrow" aria-label={branding.name}>
          <Brand branding={branding} />
          <span className="brandtext"><b>{branding.name}</b><small>{branding.tagline || 'Learning assistant'}</small></span>
        </NavLink>
        <nav className="nav">
          {groups.map((g) => (
            <div key={g.group}>
              <div className="navlabel">{t(g.group)}</div>
              {g.items.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`} title={collapsed ? t(n.label) : undefined}><Icon name={n.icon} /><span className="t">{t(n.label)}</span></NavLink>)}
            </div>
          ))}
          <div className="navlabel">{t('nav.account')}</div>
          <NavLink to="/notifications" className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}><Icon name="bell" /><span className="t">{t('nav.notifications')}</span></NavLink>
          <NavLink to="/profile" className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}><Icon name="user" /><span className="t">{t('nav.profile')}</span></NavLink>
        </nav>
        <div className="sidefoot">
          <button onClick={() => setCollapsed(!collapsed)} className="collapse-btn" aria-label={t('nav.collapse')}><Icon name={collapsed ? 'chevron' : 'chevleft'} /><span className="t">{t('nav.collapse')}</span></button>
          <div className="row" style={{ padding: '.4rem .5rem' }}><Avatar user={user} /><span className="t brandtext"><b style={{ fontSize: '.9rem' }}>{user.displayName}</b><small>{user.role}</small></span></div>
        </div>
      </aside>
      <div className="overlay" onClick={() => setDrawer(false)} />
      <div className="main">
        <header className="topbar">
          <button className="iconbtn menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <h1>{title}</h1>
          <span className="grow" />
          <button className="searchbtn" onClick={() => setPalette(true)} aria-label="Search"><Icon name="search" size={18} /><span>{t('common.search')}</span><kbd>Ctrl K</kbd></button>
          <button className="iconbtn" onClick={toggleTheme} aria-label="Toggle dark mode"><Icon name={dark ? 'sun' : 'moon'} /></button>
          <NotificationBell />
          <UserMenu />
        </header>
        <div className="content" key={loc.pathname}><Outlet /></div>
        <footer className="footer">
          <span>&copy; {new Date().getFullYear()} {branding.name}. {branding.footerText || t('footer.rights')}</span>
          <span>
            <a href="#help" onClick={(e) => { e.preventDefault(); nav('/profile?tab=help'); }}>{t('common.help')}</a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); nav('/profile?tab=privacy'); }}>{t('common.privacy')}</a>
            {branding.supportEmail && <a href={`mailto:${branding.supportEmail}`}>{t('common.contact')}</a>}
            <span aria-label="language">{lang.toUpperCase()}</span> &middot; Somo v1.0
          </span>
        </footer>
      </div>
      {palette && <CommandPalette onClose={() => setPalette(false)} onToggleTheme={toggleTheme} />}
    </div>
  );
}
