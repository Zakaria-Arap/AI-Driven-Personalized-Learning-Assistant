import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../context/I18nContext.jsx';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const { t } = useT();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  return (
    <div className="menuwrap" ref={ref}>
      <button className="iconbtn" style={{ width: 'auto', borderRadius: 99, padding: 2 }} aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(!open)}><Avatar user={user} /></button>
      {open && (
        <div className="menu" role="menu">
          <div className="row" style={{ padding: '.6rem .7rem' }}><Avatar user={user} size="md" /><div><b>{user.displayName}</b><div className="small muted">{user.role} &middot; {user.userCode}</div></div></div>
          <hr />
          <Link to="/profile" onClick={() => setOpen(false)}><Icon name="user" />{t('nav.profile')}</Link>
          <Link to="/notifications" onClick={() => setOpen(false)}><Icon name="bell" />{t('nav.notifications')}</Link>
          <hr />
          <button className="mi" onClick={async () => { await signOut(); nav('/login'); }}><Icon name="logout" />{t('common.signout')}</button>
        </div>
      )}
    </div>
  );
}
