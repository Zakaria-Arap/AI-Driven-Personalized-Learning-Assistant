import { useState } from 'react';
import ErrorNote from '../../components/ErrorNote.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { adminApi } from '../../api/endpoints.js';

export default function Audit() {
  const [q, setQ] = useState(''); const [action, setAction] = useState(''); const [page, setPage] = useState(1);
  const { data, error } = useLoad(() => adminApi.audit({ q, action, page, pageSize: 20 }), [q, action, page]);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (
    <>
      <div className="pagehead"><div><h2>Audit log</h2><p>Who did what, and when. Entries cannot be edited.</p></div></div>
      <section className="card">
        <div className="row"><input style={{ flex: 1, minWidth: 180 }} placeholder="Search by person" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search audit log" />
          <input style={{ width: 200 }} placeholder="Action, e.g. ACCOUNT" value={action} onChange={(e) => { setAction(e.target.value.toUpperCase()); setPage(1); }} aria-label="Filter by action" /></div>
        <ErrorNote error={error} />
        {!data ? <Skeleton h={240} /> : (
          <div className="tablewrap"><table><thead><tr><th>When</th><th>Action</th><th>By</th><th>Details</th></tr></thead>
            <tbody>{data.entries.map((e) => <tr key={e.id}><td className="small">{new Date(e.at).toLocaleString()}</td><td><code>{e.action}</code></td><td>{e.actor ? `${e.actor.name} (${e.actor.role})` : 'System'}</td><td className="small muted">{e.meta ? JSON.stringify(e.meta) : ''}</td></tr>)}</tbody></table></div>)}
        {data && data.entries.length === 0 && <p className="muted center">No entries match.</p>}
        <div className="row between" style={{ marginTop: '.8rem' }}><span className="small muted">{data?.total ?? 0} entries</span>
          <div className="row"><button className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="small">Page {page} of {pages}</span><button className="btn sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div></div>
      </section>
    </>
  );
}
