import { Link } from 'react-router-dom';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { learnerApi } from '../../api/endpoints.js';

const day0 = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export default function Reviews() {
  const { data, error } = useLoad(() => learnerApi.insights());
  if (error) return <ErrorNote error={error} />;
  if (!data) return <PageSkeleton />;
  const today = day0(new Date());
  const items = data.reviews.map((r) => ({ ...r, diff: Math.round((day0(r.due) - today) / 86400000) }));
  const cells = Array.from({ length: 21 }, (_, n) => { const d = new Date(today); d.setDate(d.getDate() + n); return { d, list: items.filter((x) => Math.max(x.diff, 0) === n) }; });
  const groups = [['Due now', items.filter((x) => x.diff <= 0)], ['This week', items.filter((x) => x.diff > 0 && x.diff <= 7)], ['Later', items.filter((x) => x.diff > 7)]];
  return (
    <>
      <div className="pagehead"><div><h2>Review plan</h2><p>Topics you have mastered come back after 1, 3, 7 and 21 days so they stay fresh.</p></div></div>
      <section className="card">
        <h3>Next 21 days</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 6 }}>
          {cells.map((c, n) => (
            <div key={n} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '.4rem', minHeight: 64, background: c.list.length ? 'var(--brand-soft)' : 'var(--surface-2)' }} title={c.list.map((x) => x.title).join(', ')}>
              <div className="small muted">{n === 0 ? 'Today' : c.d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
              {c.list.length > 0 && <b>{c.list.length} review{c.list.length > 1 ? 's' : ''}</b>}
            </div>
          ))}
        </div>
      </section>
      {items.length === 0 && <p className="card muted">Nothing scheduled yet. Master a topic (80%) and its reviews will appear here.</p>}
      {groups.map(([label, list]) => list.length > 0 && (
        <section key={label} className="card"><h3>{label}</h3>
          <ul className="list">{list.map((r) => <li key={r.topicId}><div><b>{r.title}</b> {r.subject && <span className="chip">{r.subject}</span>}<div className="small muted">{r.diff <= 0 ? 'Due today' : `In ${r.diff} day${r.diff > 1 ? 's' : ''}`} &middot; review step {r.step + 1}</div></div><Link className="btn sm" to={`/learner/practice/${r.topicId}`}>Review now</Link></li>)}</ul>
        </section>
      ))}
    </>
  );
}
