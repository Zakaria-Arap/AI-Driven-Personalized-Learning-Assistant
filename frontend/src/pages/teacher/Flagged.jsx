import { useState } from 'react';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { dashApi, tutorApi } from '../../api/endpoints.js';

const REASON = { wellbeing: 'Wellbeing concern', off_topic: 'Off-topic content', answer_filter_triggered: 'Tutor tried to reveal an answer' };
export default function Flagged() {
  const { data, error } = useLoad(() => dashApi.teacher());
  const [open, setOpen] = useState(null);
  const [chat, setChat] = useState(null);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <PageSkeleton />;
    return (
    <>
      <div className="pagehead"><div><h2>Flagged chats</h2><p>You can open only chats the system flagged for safeguarding in your own subject. Other tutor chats stay private to the learner.</p></div></div>
      <div className="grid g2">
        <section className="card"><h3>Flagged ({data.flagged.length})</h3>
          {data.flagged.length === 0 ? <p className="muted">Nothing flagged. All clear.</p> : (
            <ul className="list">{data.flagged.map((f) => (
              <li key={f.sessionId}><div><b>{f.learnerName || `Learner ${f.learnerId}`}</b>{f.subject && <span className="chip" style={{ marginLeft: 6 }}>{f.subject}</span>}<div className="small muted">{REASON[f.reason] || f.reason} &middot; {new Date(f.at).toLocaleString()}</div></div>
                <button className="btn sm" onClick={async () => { setOpen(f.sessionId); setChat(null); setChat(await tutorApi.transcript(f.sessionId)); }}>Open chat</button></li>
            ))}</ul>)}
        </section>
        <section className="card"><h3>Conversation</h3>
          {!open && <p className="muted">Choose a flagged chat to read it.</p>}
          {open && !chat && <p className="muted">Loading...</p>}
          {chat && <div className="chat" style={{ maxHeight: 420 }}>{chat.messages.map((m, i) => <div key={i} className={`bubble ${m.role === 'learner' ? 'me' : 'tutor'}`}>{m.content}</div>)}</div>}
          {chat && <p className="small muted">If a learner may be at risk, follow your school's safeguarding procedure and speak to the learner today.</p>}
        </section>
      </div>
    </>
  );
}
