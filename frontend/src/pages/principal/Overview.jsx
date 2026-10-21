import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import { Ring, HBars } from '../../components/charts/Charts.jsx';
import useLoad from '../../components/useLoad.js';
import { dashApi } from '../../api/endpoints.js';

export default function PrincipalOverview() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const { data, error } = useLoad(() => dashApi.principal({ subject, grade }), [subject, grade]);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <PageSkeleton />;
  const learners = data.classes.reduce((a, c) => a + c.learners, 0), support = data.classes.reduce((a, c) => a + c.needSupport, 0);
  return (
    <>
      <section className="card hero"><div className="row between"><div><span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>School overview</span><h1>School average {data.schoolAverage}%</h1><p className="muted">Class totals only. Individual learners are not shown here.</p>
        <div className="row"><Link className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#141A17' }} to="/principal/branding"><Icon name="palette" size={18} />Brand the school</Link><Link className="btn" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.6)' }} to="/announcements"><Icon name="megaphone" size={18} />Post an announcement</Link></div></div><Ring value={data.schoolAverage} size={120} sub="average" /></div></section>
      <div className="grid g3">
        <div className="card stat"><span className="ico"><Icon name="users" size={24} /></span><div><b>{learners}</b><span>Learners</span></div></div>
        <div className="card stat"><span className="ico"><Icon name="book" size={24} /></span><div><b>{data.classes.length}</b><span>Classes</span></div></div>
        <div className="card stat"><span className="ico hot"><Icon name="target" size={24} /></span><div><b>{support}</b><span>Need support</span></div></div>
      </div>
      <div className="grid g2">
        <section className="card"><h3>Average by class</h3><HBars rows={data.classes.map((c) => ({ label: `${c.classLabel} (${c.learners} learners)`, value: c.average }))} target={80} /></section>
        <section className="card"><h3>Average by subject</h3><HBars rows={data.subjects.map((x) => ({ label: `${x.name} (${x.learners} learners)`, value: x.average }))} target={80} />
          <p className="small muted">Each subject has its own teacher: {data.subjects.filter((x) => x.teacher).length} of {data.subjects.length} assigned.</p></section>
      </div>
      <section className="card">
        <div className="row between"><h3>Topic coverage</h3>
          <div className="row"><select style={{ width: 'auto' }} value={data.coverage.subject?.code || ''} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">{data.subjects.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select>
            <select style={{ width: 'auto' }} value={data.coverage.grade} onChange={(e) => setGrade(e.target.value)} aria-label="Grade">{[10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}</select></div></div>
        <p className="small muted">{data.coverage.learners} learner{data.coverage.learners === 1 ? '' : 's'} take this subject in Grade {data.coverage.grade}.</p>
        <HBars rows={data.coverage.topics.map((t) => ({ label: `${t.title} (${t.learnersStarted} started)`, value: t.average }))} target={80} />
      </section>
    </>
  );
}
