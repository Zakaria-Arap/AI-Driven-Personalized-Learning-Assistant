import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { dashApi, engageApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Assignments() {
  const toast = useToast();
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const dash = useLoad(() => dashApi.teacher({ subject, grade }), [subject, grade]);
  const list = useLoad(() => engageApi.assignments());
  const [f, setF] = useState({ classLabel: '', topicId: '', dueAt: '', note: '' });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (!dash.data || !list.data) return <PageSkeleton />;
  const d = dash.data;
  if (!d.subject) return <section className="card"><h3>No subject assigned yet</h3><p className="muted">Tasks can be set once the school assigns you a subject.</p></section>;
  const classLabel = f.classLabel || d.classes[0] || '';

  async function create(e) {
    e.preventDefault(); setError(null);
    try {
      await engageApi.createAssignment({ classLabel, topicId: Number(f.topicId), dueAt: f.dueAt || undefined, note: f.note || undefined });
      toast('Task assigned. The class has been notified.'); setF({ ...f, topicId: '', dueAt: '', note: '' }); list.reload();
    } catch (err) { setError(err); }
  }
  return (
    <>
      <div className="pagehead"><div><h2>Assignments</h2><p>Give a class a topic from your subject to master by a date. Only learners who take your subject are notified.</p></div></div>
      <div className="grid g21">
        <section className="card"><h3>Current tasks</h3>
          {list.data.items.length === 0 ? <p className="muted">No tasks yet.</p> : (
            <ul className="list">{list.data.items.map((a) => (
              <li key={a.id}><div><b>{a.topicTitle}</b> <span className="chip">{a.classLabel}</span>{a.subject && <span className="chip" style={{ marginLeft: 4 }}>{a.subject.name} G{a.subject.grade}</span>}<div className="small muted">{a.dueAt ? `Due ${new Date(a.dueAt).toLocaleDateString()}` : 'No due date'}{a.note ? ` - ${a.note}` : ''}</div></div>
                <button className="btn sm danger" onClick={async () => { await engageApi.deleteAssignment(a.id); list.reload(); }}><Icon name="trash" size={16} />Remove</button></li>
            ))}</ul>)}
        </section>
        <section className="card"><h3>New task</h3>
          <form className="stack" onSubmit={create}>
            {d.courses.length > 1 && <label>Subject<select value={d.subject.code} onChange={(e) => { setSubject(e.target.value); setF({ ...f, topicId: '', classLabel: '' }); }}>{d.courses.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>}
            <label>Grade<select value={d.grade} onChange={(e) => { setGrade(e.target.value); setF({ ...f, topicId: '', classLabel: '' }); }}>{d.grades.map((g) => <option key={g.grade} value={g.grade}>Grade {g.grade} ({g.learners} learners)</option>)}</select></label>
            <label>Class<select value={classLabel} onChange={set('classLabel')} required>{d.classes.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label>Topic<select value={f.topicId} onChange={set('topicId')} required><option value="">Choose a topic</option>{d.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
            <label>Due date<input type="date" value={f.dueAt} onChange={set('dueAt')} /></label>
            <label>Note (optional)<textarea value={f.note} onChange={set('note')} maxLength={300} /></label>
            <ErrorNote error={error} /><button className="btn primary">Assign to class</button>
          </form>
        </section>
      </div>
    </>
  );
}
