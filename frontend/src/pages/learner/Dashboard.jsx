import { Link, useSearchParams } from 'react-router-dom';
import SubjectTabs from '../../components/SubjectTabs.jsx';
import Icon from '../../components/Icon.jsx';
import MasteryChip from '../../components/MasteryChip.jsx';
import Bar from '../../components/Bar.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import { Ring, ActivityBars, Heatmap } from '../../components/charts/Charts.jsx';
import useLoad from '../../components/useLoad.js';
import { learnerApi, engageApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useT } from '../../context/I18nContext.jsx';

const greet = (t) => { const h = new Date().getHours(); return t(h < 12 ? 'greet.morning' : h < 17 ? 'greet.afternoon' : 'greet.evening'); };

export default function LearnerDashboard() {
  const { user } = useAuth();
  const { t } = useT();
  const [sp, setSp] = useSearchParams();
  const subject = sp.get('subject') || undefined;
  const d = useLoad(() => learnerApi.dashboard(subject), [subject]);
  const ins = useLoad(() => learnerApi.insights());
  const tasks = useLoad(() => engageApi.assignments());
  if (d.error || ins.error) return <ErrorNote error={d.error || ins.error} />;
  if (!d.data || !ins.data) return <PageSkeleton />;
  const dash = d.data, i = ins.data;
  const goalPct = Math.min(100, Math.round((i.todayCount / i.dailyGoal) * 100));
  const open = (tasks.data?.items || []).filter((x) => !x.done);

  return (
    <>
      <SubjectTabs items={dash.subjects.map((x) => ({ code: x.code, name: x.name, note: `${x.overall}%` }))} value={dash.subject.code} onChange={(code) => setSp({ subject: code })} />
      {dash.needsPathway && <div className="info">You are studying the compulsory subjects. <Link to="/learner/subjects">Choose your pathway</Link> to add your electives.</div>}
      <section className="card hero">
        <div className="row between">
          <div><span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>{greet(t)}</span><h1>{user.displayName.split(' ')[0]}, ready to practise {dash.subject.name}?</h1>
            <p className="muted">{dash.mastered} of {dash.totalTopics} topics mastered in Grade {dash.subject.grade} {dash.subject.name}. Teacher: {dash.subject.teacher || 'to be assigned'}.</p>
            {dash.next && <Link className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#141A17' }} to={`/learner/practice/${dash.next.topicId}`}><Icon name="sparkle" size={18} />{dash.next.type === 'review' ? 'Review' : dash.next.type === 'continue' ? 'Continue' : 'Start'}: {dash.next.title}</Link>}
          </div>
          <Ring value={dash.overall} size={128} label={`${dash.subject.name} mastery`} sub="in this subject" />
        </div>
      </section>

      <div className="grid g4">
        <div className="card stat"><span className="ico hot"><Icon name="flame" size={24} className="flame" /></span><div><b>{i.streak}</b><span>{t('learner.streak')} (best {i.bestStreak})</span></div></div>
        <div className="card stat"><span className="ico accent"><Icon name="star" size={24} /></span><div><b>{i.xp}</b><span>{t('learner.xp')} &middot; {t('learner.level')} {i.level}</span><div className="bar" style={{ marginTop: 6, width: 130 }}><i style={{ width: `${i.levelProgress}%` }} /></div></div></div>
        <div className="card stat"><span className="ico"><Icon name="target" size={24} /></span><div><b>{i.todayCount}/{i.dailyGoal}</b><span>{t('learner.goal')}</span><div className="bar" style={{ marginTop: 6, width: 130 }}><i style={{ width: `${goalPct}%` }} /></div></div></div>
        <div className="card stat"><span className="ico"><Icon name="chart" size={24} /></span><div><b>{i.accuracy ?? '-'}{i.accuracy !== null && '%'}</b><span>Accuracy ({i.totals.attempts} answers)</span></div></div>
      </div>

      <div className="grid g21">
        <section className="card">
          <div className="row between"><h3>Last 14 days</h3><span className="small muted">Green = correct, gold = to review</span></div>
          <ActivityBars data={i.activity.slice(-14)} goal={i.dailyGoal} />
          <h3 style={{ marginTop: '1.2rem' }}>12-week practice calendar</h3>
          <Heatmap days={i.activity} />
        </section>
        <section className="card">
          <h3>Tasks from your teacher</h3>
          {open.length === 0 ? <p className="muted">No open tasks. Nice work.</p> : (
            <ul className="list">{open.map((a) => (
              <li key={a.id}><div><b>{a.topicTitle}</b> {a.subject && <span className="chip">{a.subject.name}</span>}<div className="small muted">{a.dueAt ? `Due ${new Date(a.dueAt).toLocaleDateString()}` : 'No due date'}{a.overdue && <span style={{ color: 'var(--danger)' }}> &middot; overdue</span>}</div><div className="bar" style={{ width: 150, marginTop: 6 }}><i style={{ width: `${a.score}%` }} /></div></div><Link className="btn sm" to={`/learner/practice/${a.topicId}`}>{a.score}% &rarr;</Link></li>
            ))}</ul>
          )}
          {i.reviews.length > 0 && <Link to="/learner/reviews" className="small">See your review plan &rarr;</Link>}
        </section>
      </div>

      <section>
        <h2>{dash.subject.name} topic map</h2>
        <div className="grid gauto">
          {dash.topicMap.map((tm) => (
            <Link key={tm.topicId} to={`/learner/practice/${tm.topicId}`} className="card hover topiccard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="eyebrow">{tm.strand}</span><h3>{tm.title}</h3>
              <Bar value={tm.score} target={dash.target} />
              <div className="row between"><MasteryChip band={tm.band} /><b>{tm.score}%</b></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
