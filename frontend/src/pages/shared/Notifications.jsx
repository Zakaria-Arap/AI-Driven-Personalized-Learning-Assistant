import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { engageApi } from '../../api/endpoints.js';

export default function Notifications() {
  const nav = useNavigate();
  const { data, error, reload } = useLoad(() => engageApi.notifications());
  return (
    <>
      <div className="pagehead"><div><h2>Notifications</h2><p>{data ? `${data.unread} unread` : ''}</p></div>
        {data?.unread > 0 && <button className="btn" onClick={async () => { await engageApi.readAll(); reload(); }}><Icon name="check" size={18} />Mark all read</button>}</div>
      <ErrorNote error={error} />
      {!data ? <Skeleton h={200} /> : (
        <section className="card">
          {data.items.length === 0 ? <p className="muted center">You are all caught up.</p> : (
            <ul className="list">{data.items.map((n) => (
              <li key={n.id} style={{ cursor: n.link ? 'pointer' : 'default', fontWeight: n.read ? 400 : 600 }} onClick={async () => { if (!n.read) await engageApi.readNotification(n.id); if (n.link) nav(n.link); else reload(); }}>
                <div><div>{!n.read && <span className="chip learning" style={{ marginRight: 6 }}>New</span>}{n.title}</div>{n.body && <div className="small muted" style={{ fontWeight: 400 }}>{n.body}</div>}</div>
                <span className="small muted">{new Date(n.at).toLocaleString()}</span></li>
            ))}</ul>)}
        </section>)}
    </>
  );
}
