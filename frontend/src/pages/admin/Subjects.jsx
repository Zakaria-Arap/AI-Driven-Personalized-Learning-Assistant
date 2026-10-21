import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { adminApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';

const PATH = { compulsory: 'Compulsory', stem: 'STEM', social: 'Social Sciences' };
export default function AdminSubjects() {
  const toast = useToast();
  const courses = useLoad(() => adminApi.courses());
  const teachers = useLoad(() => adminApi.allUsers('teacher'));
  if (courses.error) return <ErrorNote error={courses.error} />;
  if (!courses.data || !teachers.data) return <PageSkeleton />;
  const assign = async (c, value) => {
    try { await adminApi.setCourseTeacher(c.id, value ? Number(value) : null); toast(`${c.name} teacher updated`); courses.reload(); } catch (e) { toast(e.message, 'error'); }
  };
  const list = courses.data.courses;
  return (
    <>
      <div className="pagehead"><div><h2>Subjects and teachers</h2><p>Every subject has one teacher. A teacher sees only the learners enrolled in their own subject, and sets tasks only in it.</p></div></div>
      <div className="grid g3">
        <div className="card stat"><div><b>{list.length}</b><span>Subjects</span></div></div>
        <div className="card stat"><div><b>{list.filter((c) => c.teacher).length}</b><span>With a teacher</span></div></div>
        <div className="card stat"><div><b>{list.filter((c) => !c.teacher).length}</b><span>Need a teacher</span></div></div>
      </div>
      <section className="card">
        <div className="tablewrap"><table><thead><tr><th>Subject</th><th>Pathway</th><th>Learners (G10 / G11 / G12)</th><th style={{ minWidth: 220 }}>Teacher</th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id}><td><b>{c.name}</b></td><td>{PATH[c.pathway]}</td>
              <td>{[10, 11, 12].map((g) => c.byGrade[g] || 0).join(' / ')} <span className="small muted">({c.learners})</span></td>
              <td><select value={c.teacher?.id || ''} onChange={(e) => assign(c, e.target.value)} aria-label={`Teacher for ${c.name}`}><option value="">Not assigned</option>{teachers.data.users.filter((t) => t.active !== false).map((t) => <option key={t.id} value={t.id}>{t.displayName || t.fullName} ({t.userCode})</option>)}</select></td></tr>
          ))}</tbody></table></div>
        <p className="small muted">To set a learner's pathway and electives, open Accounts and choose the books icon on their row.</p>
      </section>
    </>
  );
}
