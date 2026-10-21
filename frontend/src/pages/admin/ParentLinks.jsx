import { useState } from 'react';
import ErrorNote from '../../components/ErrorNote.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { adminApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ParentLinks() {
  const toast = useToast();
  const links = useLoad(() => adminApi.links());
  const parents = useLoad(() => adminApi.allUsers('parent'));
  const learners = useLoad(() => adminApi.allUsers('learner'));
  const [f, setF] = useState({ parentId: '', learnerId: '' });
  const [error, setError] = useState(null);
  const run = async (fn, msg) => { try { await fn(); toast(msg); links.reload(); } catch (e) { toast(e.message, 'error'); } };
  async function add(e) { e.preventDefault(); setError(null); try { await adminApi.link(Number(f.parentId), Number(f.learnerId)); toast('Linked'); setF({ parentId: '', learnerId: '' }); links.reload(); } catch (err) { setError(err); } }
  return (
    <>
      <div className="pagehead"><div><h2>Parent links</h2><p>A parent sees a child's progress only after the school links them. Tutor chats stay private unless you record consent.</p></div></div>
      <div className="grid g21">
        <section className="card"><h3>Current links</h3>
          <ErrorNote error={links.error} />
          {!links.data ? <Skeleton h={160} /> : links.data.links.length === 0 ? <p className="muted">No links yet.</p> : (
            <div className="tablewrap"><table><thead><tr><th>Parent</th><th>Learner</th><th>Chat consent</th><th></th></tr></thead>
              <tbody>{links.data.links.map((l) => (
                <tr key={l.id}><td>{l.parent.name}<div className="small muted">{l.parent.userCode}</div></td><td>{l.learner.name}<div className="small muted">{l.learner.userCode} · {l.learner.classLabel}</div></td>
                  <td><label className="switch" style={{ margin: 0 }}><input type="checkbox" checked={l.canViewTutorChats} aria-label="Allow parent to view tutor chats" onChange={(e) => run(() => adminApi.consent(l.id, e.target.checked), e.target.checked ? 'Consent recorded' : 'Consent withdrawn')} /></label></td>
                  <td><button className="btn sm danger" onClick={() => confirm('Remove this link?') && run(() => adminApi.unlink(l.id), 'Link removed')}>Unlink</button></td></tr>
              ))}</tbody></table></div>)}
        </section>
        <section className="card"><h3>Link a parent</h3>
          <form className="stack" onSubmit={add}>
            <label>Parent<select value={f.parentId} onChange={(e) => setF({ ...f, parentId: e.target.value })} required><option value="">Choose</option>{parents.data?.users.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.userCode})</option>)}</select></label>
            <label>Learner<select value={f.learnerId} onChange={(e) => setF({ ...f, learnerId: e.target.value })} required><option value="">Choose</option>{learners.data?.users.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.userCode})</option>)}</select></label>
            <ErrorNote error={error} /><button className="btn primary">Link after checking identity</button>
          </form>
        </section>
      </div>
    </>
  );
}
