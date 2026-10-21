import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { engageApi } from '../api/endpoints.js';
import { useT } from '../context/I18nContext.jsx';

export default function NotificationBell() {
  const { t } = useT();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unread: 0, items: [] });
  const ref = useRef(null);
  const load = useCallback(() => engageApi.notifications().then(setData).catch(() => {}), []);
  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);
  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  const go = async (n) => { setOpen(false); if (!n.read) { await engageApi.readNotification(n.id).catch(() => {}); load(); } if (n.link) nav(n.link); };
  return (
    <div className="menuwrap" ref={ref}>
      <button className="iconbtn" aria-label={`${t('notif.title')}, ${data.unread} unread`} aria-expanded={open} onClick={() => { setOpen(!open); if (!open) load(); }}>
        <Icon name="bell" />{data.unread > 0 && <span className="dot">{data.unread > 9 ? '9+' : data.unread}</span>}
      </button>
      {open && (
        <div className="menu notifs" role="menu">
          <div className="row between" style={{ padding: '.7rem .9rem', borderBottom: '1px solid var(--line)' }}>
            <b>{t('notif.title')}</b>
            {data.unread > 0 && <button className="btn ghost sm" onClick={async () => { await engageApi.readAll(); load(); }}>{t('notif.markall')}</button>}
          </div>
          {data.items.length === 0 && <p className="muted center" style={{ padding: '1.2rem' }}>{t('notif.none')}</p>}
          {data.items.slice(0, 8).map((n) => (
            <div key={n.id} className={`notif ${n.read ? '' : 'unread'}`} onClick={() => go(n)} role="menuitem" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && go(n)}>
              <b>{n.title}</b>{n.body && <span>{n.body}</span>}<span>{new Date(n.at).toLocaleString()}</span>
            </div>
          ))}
          <Link to="/notifications" onClick={() => setOpen(false)} style={{ justifyContent: 'center', fontWeight: 600 }}>View all</Link>
        </div>
      )}
    </div>
  );
}
