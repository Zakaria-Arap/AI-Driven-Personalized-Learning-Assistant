import { Link } from 'react-router-dom';
import { useState } from 'react';
import Bar from '../../components/Bar.jsx';
import Modal from '../../components/Modal.jsx';
import PathwayPicker from '../../components/PathwayPicker.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { learnerApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Subjects() {
  const toast = useToast();
  const { user, refresh } = useAuth();
  const list = useLoad(() => learnerApi.subjects());
  const [opts, setOpts] = useState(null);
  const [error, setError] = useState(null);
  if (list.error) return <ErrorNote error={list.error} />;
  if (!list.data) return <PageSkeleton />;
  const { subjects, needsPathway } = list.data;
  const open = async () => { try { setOpts(await learnerApi.subjectOptions()); } catch (e) { setError(e); } };
  return (
    <>
      <div className="pagehead"><div><h2>My subjects</h2><p>Grade {user.grade || 10}. Each subject has its own teacher. Compulsory subjects come with your class; pick your pathway for the rest.</p></div>
        <button className="btn" onClick={open}>{needsPathway ? 'Choose my pathway' : 'Change my subjects'}</button></div>
      <ErrorNote error={error} />
      {needsPathway && <div className="info"><b>You have not chosen a pathway yet.</b> You can practise the compulsory subjects now. Choose STEM or Social Sciences to add your electives.</div>}
      <div className="grid gauto">
        {subjects.map((s) => (
          <Link key={s.code} to={`/learner?subject=${s.code}`} className="card hover subjcard">
            <span className="eyebrow">{s.pathway === 'compulsory' ? 'Compulsory' : s.pathway === 'stem' ? 'STEM' : 'Social Sciences'}</span>
            <h3>{s.name}</h3>
            <div className="small muted">Teacher: {s.teacher || 'to be assigned'}</div>
            <Bar value={s.overall} target={80} />
            <div className="row between small"><span>{s.mastered} of {s.totalTopics} topics mastered</span><b>{s.overall}%</b></div>
            {s.next && <div className="small"><b>Next:</b> {s.next.title}</div>}
          </Link>
        ))}
      </div>
      {opts && (
        <Modal title="Choose your pathway" onClose={() => setOpts(null)} wide>
          <PathwayPicker options={opts} onSave={async (pathway, codes) => { await learnerApi.chooseSubjects(pathway, codes); setOpts(null); toast('Your subjects are saved'); list.reload(); refresh?.(); }} />
        </Modal>
      )}
    </>
  );
}
