import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { engageApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const CAN_POST = ['teacher', 'principal', 'admin'];
export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, error, reload } = useLoad(() => engageApi.announcements());
  const [f, setF] = useState({ title: '', body: '', audience: 'all', pinned: false });
  const [err, setErr] = useState(null);
  const canPost = CAN_POST.includes(user.role);
  const audiences = user.role === 'teacher' ? ['learner', 'parent'] : ['all', 'learner', 'teacher', 'parent'];
  async function post(e) {
    e.preventDefault(); setErr(null);
    try { await engageApi.postAnnouncement({ ...f, audience: audiences.includes(f.audience) ? f.audience : audiences[0] }); toast('Posted'); setF({ title: '', body: '', audience: audiences[0], pinned: false }); reload(); } catch (x) { setErr(x); }
  }
  return (
    <>
      <div className="pagehead"><div><h2>Announcements</h2><p>News from your school.</p></div></div>
      <div className={canPost ? 'grid g21' : ''}>
        <section className="stack">
          <ErrorNote error={error} />
          {!data ? <Skeleton h={160} /> : data.items.length === 0 ? <div className="card"><p className="muted">No announcements yet.</p></div> : data.items.map((a) => (
            <article key={a.id} className="card">
              <div className="row between"><h3 style={{ margin: 0 }}>{a.pinned && <Icon name="pin" size={18} />} {a.title}</h3>
                {(a.mine || user.role !== 'teacher' && CAN_POST.includes(user.role)) && <div className="row">
                  <button className="iconbtn" aria-label="Pin or unpin" onClick={async () => { await engageApi.pinAnnouncement(a.id); reload(); }}><Icon name="pin" size={18} /></button>
                  <button className="iconbtn" aria-label="Delete announcement" onClick={async () => { if (confirm('Delete this announcement?')) { await engageApi.deleteAnnouncement(a.id); reload(); } }}><Icon name="trash" size={18} /></button></div>}</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{a.body}</p>
              <div className="small muted">{a.author} ({a.authorRole}) &middot; {new Date(a.at).toLocaleDateString()} &middot; for {a.audience}</div>
            </article>))}
        </section>
        {canPost && (
          <section className="card"><h3>New announcement</h3>
            <form className="stack" onSubmit={post}>
              <label>Title<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required minLength={3} /></label>
              <label>Message<textarea rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} required minLength={3} /></label>
              <label>Who should see it<select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}>{audiences.map((a) => <option key={a}>{a}</option>)}</select></label>
              <label className="switch"><input type="checkbox" checked={f.pinned} onChange={(e) => setF({ ...f, pinned: e.target.checked })} />Pin to the top</label>
              <ErrorNote error={err} /><button className="btn primary">Post</button>
            </form>
          </section>)}
      </div>
    </>
  );
}
