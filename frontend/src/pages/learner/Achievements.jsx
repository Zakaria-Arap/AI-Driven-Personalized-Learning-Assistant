import Icon from '../../components/Icon.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { learnerApi } from '../../api/endpoints.js';

const ICON = { first_step: 'sparkle', sharp_10: 'target', fifty_club: 'chart', streak_3: 'flame', streak_7: 'flame', independent: 'star', explorer: 'globe', topic_master: 'trophy', all_rounder: 'trophy' };
export default function Achievements() {
  const { data, error } = useLoad(() => learnerApi.insights());
  if (error) return <ErrorNote error={error} />;
  if (!data) return <PageSkeleton />;
  const earned = data.badges.filter((b) => b.earned).length;
  return (
    <>
      <section className="card hero">
        <div className="row between"><div><span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>Level {data.level}</span><h1>{data.xp} XP</h1><p className="muted">{data.nextLevelXp - data.xp} XP to level {data.level + 1}. {earned} of {data.badges.length} badges earned.</p></div>
          <div style={{ minWidth: 220 }}><div className="bar" style={{ background: 'rgba(255,255,255,.25)' }}><i style={{ width: `${data.levelProgress}%`, background: 'var(--accent)' }} /></div><div className="small" style={{ opacity: .8, marginTop: 4 }}>Earn 10 XP per correct answer, 2 per try, 50 per mastered topic.</div></div></div>
      </section>
      <div className="grid g3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
        {data.badges.map((b) => (
          <div key={b.key} className={`card badgecard ${b.earned ? '' : 'locked'}`}>
            <span className="medal"><Icon name={ICON[b.key] || 'star'} size={30} /></span><b>{b.title}</b><span className="small muted">{b.desc}</span>
            <span className="chip" style={{ borderColor: b.earned ? 'var(--ok)' : undefined }}>{b.earned ? 'Earned' : 'Locked'}</span>
          </div>
        ))}
      </div>
    </>
  );
}
