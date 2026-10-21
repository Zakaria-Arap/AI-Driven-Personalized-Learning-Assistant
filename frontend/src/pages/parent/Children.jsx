import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import MasteryChip from '../../components/MasteryChip.jsx';
import Bar from '../../components/Bar.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import { Ring, ActivityBars } from '../../components/charts/Charts.jsx';
import useLoad from '../../components/useLoad.js';
import SubjectTabs from '../../components/SubjectTabs.jsx';
import { dashApi } from '../../api/endpoints.js';

export default function Children() {
  const kids = useLoad(() => dashApi.children());
  const [picked, setPicked] = useState(null);
  const id = picked ?? kids.data?.children?.[0]?.learnerId;
  const [subject, setSubject] = useState(undefined);
  const sum = useLoad(() => (id ? dashApi.childSummary(id, subject) : Promise.resolve(null)), [id, subject]);
  if (kids.error) return <ErrorNote error={kids.error} />;
  if (!kids.data) return <PageSkeleton />;
  if (kids.data.children.length === 0) return <section className="card"><h3>No child linked yet</h3><p className="muted">The school office links accounts after checking. Please contact them if you expect to see your child here.</p></section>;
  const child = kids.data.children.find((c) => c.learnerId === id);
  const s = sum.data;
  return (
    <>
      <div className="pagehead"><div><h2>{child.name}</h2><p>Grade {child.grade} &middot; Class {child.classLabel}</p></div>
        {kids.data.children.length > 1 && <select style={{ width: 'auto' }} value={id} onChange={(e) => { setPicked(Number(e.target.value)); setSubject(undefined); }} aria-label="Choose child">{kids.data.children.map((c) => <option key={c.learnerId} value={c.learnerId}>{c.name}</option>)}</select>}</div>
      <ErrorNote error={sum.error} />
      {!s ? <PageSkeleton /> : (
        <>
          <section className="card"><h3>All subjects</h3>
            <ul className="list">{s.subjects.map((x) => <li key={x.code}><div><b>{x.name}</b><div className="small muted">Teacher: {x.teacher || 'to be assigned'} &middot; {x.mastered} of {x.totalTopics} topics mastered</div></div><span className="row"><div style={{ width: 110 }}><Bar value={x.overall} target={s.target} /></div><b>{x.overall}%</b></span></li>)}</ul></section>
          <SubjectTabs items={s.subjects.map((x) => ({ code: x.code, name: x.name }))} value={s.subject.code} onChange={setSubject} />
          <section className="card hero"><div className="row between"><div><span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>This week</span><h1>{s.weekly.questionsAnswered} questions answered</h1><p className="muted">{s.weekly.correct} correct &middot; practised on {s.weekly.daysActive} day{s.weekly.daysActive === 1 ? '' : 's'}</p></div><Ring value={s.overall} size={120} sub="all subjects" /></div></section>
          <div className="grid g3">
            <div className="card stat"><span className="ico"><Icon name="trophy" size={24} /></span><div><b>{s.mastered}/{s.totalTopics}</b><span>Topics mastered in {s.subject.name}</span></div></div>
            <div className="card stat"><span className="ico accent"><Icon name="target" size={24} /></span><div><b>{s.target}%</b><span>Target per topic</span></div></div>
            <div className="card stat"><span className="ico hot"><Icon name="flame" size={24} /></span><div><b>{s.weekly.daysActive}</b><span>Active days this week</span></div></div>
          </div>
          <div className="grid g21">
            <section className="card"><h3>Last 14 days</h3><ActivityBars data={s.activity} /></section>
            <section className="card"><h3>Next step</h3>{s.next ? <p><b>{s.next.title}</b><br /><span className="muted">{s.next.reason}</span></p> : <p className="muted">All caught up.</p>}
              <div className="info small"><Icon name="lock" size={16} /> Tutor conversations are private to your child unless the school records consent.{child.canViewTutorChats ? ' The school has recorded consent for you.' : ''}</div></section>
          </div>
          <section className="card"><h3>{s.subject.name} topics</h3><ul className="list">{s.topicMap.map((t) => <li key={t.title}><span>{t.title}</span><span className="row"><div style={{ width: 110 }}><Bar value={t.score} target={s.target} /></div><MasteryChip band={t.band} /></span></li>)}</ul></section>
        </>
      )}
    </>
  );
}
