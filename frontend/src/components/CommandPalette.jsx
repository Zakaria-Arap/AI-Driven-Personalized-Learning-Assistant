import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { flat } from './navConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../context/I18nContext.jsx';
import { learnerApi } from '../api/endpoints.js';

// Ctrl/Cmd+K: jump to any page, open any topic (learners), or run quick actions.
export default function CommandPalette({ onClose, onToggleTheme }) {
  const { user, signOut } = useAuth();
  const { t } = useT();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [topics, setTopics] = useState([]);
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); if (user.role === 'learner') learnerApi.dashboard().then((d) => setTopics(d.topicMap)).catch(() => {}); }, [user.role]);

  const items = useMemo(() => {
    const pages = flat(user.role).map((n) => ({ id: n.to, label: t(n.label), icon: n.icon, hint: 'Page', run: () => nav(n.to) }));
    const tp = topics.map((x) => ({ id: `t${x.topicId}`, label: `Practise: ${x.title}`, icon: 'book', hint: `${x.score}%`, run: () => nav(`/learner/practice/${x.topicId}`) }));
    const actions = [
      { id: 'theme', label: 'Toggle dark mode', icon: 'moon', hint: 'Action', run: onToggleTheme },
      { id: 'out', label: t('common.signout'), icon: 'logout', hint: 'Action', run: async () => { await signOut(); nav('/login'); } },
    ];
    return [...pages, ...tp, ...actions].filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase()));
  }, [user.role, topics, q, t, nav, onToggleTheme, signOut]);

  useEffect(() => setSel(0), [q]);
  const run = (i) => { if (!i) return; onClose(); i.run(); };
  const key = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') run(items[sel]);
    else if (e.key === 'Escape') onClose();
  };
  return (
    <div className="modalback" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder={t('common.search')} aria-label="Search" />
        <ul role="listbox">
          {items.length === 0 && <li className="muted">No matches</li>}
          {items.map((i, n) => <li key={i.id} role="option" aria-selected={n === sel} className={n === sel ? 'sel' : ''} onMouseEnter={() => setSel(n)} onClick={() => run(i)}><Icon name={i.icon} />{i.label}<small>{i.hint}</small></li>)}
        </ul>
      </div>
    </div>
  );
}
