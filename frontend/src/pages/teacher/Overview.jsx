import Icon from '../../components/Icon.jsx';
import Bar from '../../components/Bar.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import { MatrixHeat } from '../../components/charts/Charts.jsx';
import useLoad from '../../components/useLoad.js';
import { dashApi } from '../../api/endpoints.js';
import { Link, useSearchParams } from 'react-router-dom';
import SubjectTabs from '../../components/SubjectTabs.jsx';

export default function TeacherOverview() {
  const [sp, setSp] = useSearchParams();
  const q = { subject: sp.get('subject') || undefined, grade: sp.get('grade') || undefined, classLabel: sp.get('classLabel') || undefined };
  const { data, error } = useLoad(() => dashApi.teacher(q), [q.subject, q.grade, q.classLabel]);
  const go = (patch) => { const n = { ...Object.fromEntries(sp), ...patch }; Object.keys(n).forEach((k) => !n[k] && delete n[k]); setSp(n); };
  if (error) return <ErrorNote error={error} />;
  if (!data) return <PageSkeleton />;
  if (!data.subject) return <section className="card"><h3>No subject assigned yet</h3><p className="muted">The school office assigns each subject to its teacher. Once yours is set, the learners enrolled in it will appear here.</p></section>;
  const support = data.learners.filter((l) => l.needsSupport).length;
  return (
    <>
      {data.courses.length > 1 && <SubjectTabs items={data.courses} value={data.subject.code} onChange={(code) => go({ subject: code, grade: '', classLabel: '' })} label="Your subjects" />}
      <div className="row">
        <div className="seg" role="group" aria-label="Grade">{data.grades.map((g) => <button key={g.grade} className={data.grade === g.grade ? 'on' : ''} onClick={() => go({ grade: g.grade, classLabel: '' })}>Grade {g.grade} <span className="small">({g.learners})</span></button>)}</div>
        <select style={{ width: 'auto' }} value={q.classLabel || ''} onChange={(e) => go({ classLabel: e.target.value })} aria-label="Class"><option value="">All classes</option>{data.classes.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <section className="card hero"><span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>{data.subject.name} &middot; Grade {data.grade} &middot; {data.classLabel === 'All' ? 'all classes' : `class ${data.classLabel}`}</span><h1>Average {data.classAverage}%</h1><p className="muted">{data.learners.length} learner{data.learners.length === 1 ? '' : 's'} take {data.subject.name} &middot; {support} may need support &middot; {data.flagged.length} flagged chat{data.flagged.length === 1 ? '' : 's'}</p></section>
      <div className="grid g4">
        <div className="card stat"><span className="ico"><Icon name="users" size={24} /></span><div><b>{data.learners.length}</b><span>Learners</span></div></div>
        <div className="card stat"><span className="ico"><Icon name="chart" size={24} /></span><div><b>{data.classAverage}%</b><span>Class average</span></div></div>
        <div className="card stat"><span className="ico hot"><Icon name="target" size={24} /></span><div><b>{support}</b><span>Need support</span></div></div>
        <Link to="/teacher/flagged" className="card stat hover" style={{ textDecoration: 'none', color: 'inherit' }}><span className="ico accent"><Icon name="flag" size={24} /></span><div><b>{data.flagged.length}</b><span>Flagged chats</span></div></Link>
      </div>
      <section className="card"><h3>Mastery heat map</h3><p className="small muted">Each square is a learner's score in a topic. Darker is stronger. Spot gaps across the whole class at a glance.</p><MatrixHeat topics={data.topics} rows={data.learners} /></section>
      <section className="card"><h3>Learners</h3>{data.learners.length === 0 && <p className="muted">No learners are enrolled in {data.subject.name} for Grade {data.grade}.</p>}
        <div className="tablewrap"><table><thead><tr><th>Name</th><th>Class</th><th style={{ minWidth: 180 }}>Overall</th><th>Mastered</th><th>Started</th><th>Status</th></tr></thead>
          <tbody>{data.learners.map((l) => (
            <tr key={l.learnerId}><td><b>{l.name}</b></td><td>{l.classLabel}</td><td><Bar value={l.overall} target={80} /><span className="small">{l.overall}%</span></td><td>{l.mastered}</td><td>{l.started}</td>
              <td>{l.needsSupport ? <span className="chip learning">Needs support</span> : l.started ? <span className="chip nearly_there">On track</span> : <span className="chip not_started">Not started</span>}</td></tr>
          ))}</tbody></table></div>
      </section>
    </>
  );
}
