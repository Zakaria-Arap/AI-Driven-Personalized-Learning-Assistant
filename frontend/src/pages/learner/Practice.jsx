import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorNote from '../../components/ErrorNote.jsx';
import MasteryChip from '../../components/MasteryChip.jsx';
import Confetti from '../../components/Confetti.jsx';
import Icon from '../../components/Icon.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import { learnerApi, tutorApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Practice() {
  const { topicId } = useParams();
  const toast = useToast();
  const [set, setSet] = useState(null);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [tutor, setTutor] = useState({ sessionId: null, messages: [], level: 0, busy: false });
  const [ask, setAsk] = useState('');
  const chat = useRef(null);

  useEffect(() => { setSet(null); setI(0); setScore(0); setResult(null); learnerApi.practice(topicId).then(setSet).catch(setError); }, [topicId]);
  useEffect(() => { chat.current?.scrollTo({ top: chat.current.scrollHeight, behavior: 'smooth' }); }, [tutor.messages, tutor.busy]);

  const q = set?.questions[i];
  const finished = set && set.questions.length > 0 && i >= set.questions.length;

  async function check(e) {
    e.preventDefault(); setError(null);
    try {
      const r = await learnerApi.answer(q.id, answer, tutor.level);
      setResult(r); if (r.correct) setScore((s) => s + 1);
      (r.newBadges || []).forEach((b) => toast(`Badge earned: ${b.title}`, 'ok'));
    } catch (err) { setError(err); }
  }
  const next = () => { setI(i + 1); setAnswer(''); setResult(null); setTutor({ sessionId: null, messages: [], level: 0, busy: false }); setAsk(''); };
  async function askTutor(text) {
    setError(null); setTutor((t) => ({ ...t, busy: true, messages: [...t.messages, { from: 'me', text }] })); setAsk('');
    try {
      let sid = tutor.sessionId;
      if (!sid) sid = (await tutorApi.start(q.id)).sessionId;
      const r = await tutorApi.send(sid, text);
      setTutor((t) => ({ sessionId: sid, busy: false, level: r.level, messages: [...t.messages, { from: 'tutor', text: r.reply }] }));
    } catch (err) { setError(err); setTutor((t) => ({ ...t, busy: false })); }
  }

  if (error && !set) return <ErrorNote error={error} />;
  if (!set) return <PageSkeleton />;
  return (
    <>
      <Confetti run={finished && score >= Math.ceil(set.questions.length / 2)} />
      <div className="pagehead"><div><Link to={set.topic.subject ? `/learner?subject=${set.topic.subject.code}` : '/learner'} className="small">&larr; Back to {set.topic.subject ? set.topic.subject.name : 'my learning'}</Link><h2>{set.topic.title}</h2><p>{set.topic.outcome}</p></div>
        {!finished && <div style={{ minWidth: 180 }}><div className="small muted">Question {Math.min(i + 1, set.questions.length)} of {set.questions.length}</div><div className="bar"><i style={{ width: `${(i / set.questions.length) * 100}%` }} /></div></div>}</div>
      <ErrorNote error={error} />
      {set.questions.length === 0 && <p className="card">No questions yet for this topic.</p>}
      {finished && (
        <section className="card hero center"><h1>{score === set.questions.length ? 'Perfect round!' : 'Round complete'}</h1><p className="muted">You got {score} of {set.questions.length} right.</p>
          <div className="row" style={{ justifyContent: 'center' }}><Link className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#141A17' }} to="/learner">See my progress</Link><button className="btn" onClick={() => { setI(0); setScore(0); learnerApi.practice(topicId).then(setSet); }}>Practise again</button></div></section>
      )}
      {q && (
        <div className="grid g21" style={{ gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)' }}>
          <section className="card">
            <span className="eyebrow">Question {i + 1}</span>
            <h3 className="prompt">{q.prompt}</h3>
            <form onSubmit={check} className={q.type === 'choice' ? undefined : 'row'} style={q.type === 'choice' ? undefined : { flexWrap: 'nowrap' }}>
              {q.type === 'choice' ? (
                <>
                  <div className="choices" role="radiogroup" aria-label="Choose one answer">
                    {(q.options || []).map((o, n) => {
                      const mine = answer === o;
                      const cls = result ? (o === result.correctAnswer || (result.correct && mine) ? 'right' : mine ? 'wrong' : '') : mine ? 'on' : '';
                      return <button type="button" key={o} role="radio" aria-checked={mine} className={cls} disabled={!!result} onClick={() => setAnswer(o)}><b>{'ABCDE'[n]}</b><span>{o}</span></button>;
                    })}
                  </div>
                  {!result && <button className="btn primary" disabled={!answer}>Check</button>}
                </>
              ) : (
                <>
                  <input value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!!result} placeholder="Your answer" required autoFocus aria-label="Your answer" />
                  {!result && <button className="btn primary">Check</button>}
                </>
              )}
            </form>
            {result && (
              <div className={`feedback ${result.correct ? 'good' : 'bad'}`}>
                <b>{result.correct ? 'Correct! Well done.' : `Not quite. The answer is ${result.correctAnswer}.`}</b>
                <div className="row"><MasteryChip band={result.band} /><span>{Math.round(result.score)}% in this topic</span></div>
                {result.solution && <pre className="solution">{result.solution}</pre>}
                <button className="btn primary" onClick={next} autoFocus>{i + 1 < set.questions.length ? 'Next question' : 'Finish'}</button>
              </div>
            )}
          </section>
          <section className="card">
            <div className="row between"><h3><Icon name="sparkle" size={18} /> Ask the tutor</h3><span className="small muted">Level {tutor.level} of 5</span></div>
            <div className="ladder" aria-hidden="true">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= tutor.level ? 'on' : ''} />)}</div>
            <p className="small muted">Hints get stronger one step at a time.</p>
            <div className="chat" ref={chat} aria-live="polite">
              {tutor.messages.map((m, k) => <div key={k} className={`bubble ${m.from}`}>{m.text}</div>)}
              {tutor.busy && <div className="bubble tutor"><span className="typing"><i /><i /><i /></span></div>}
            </div>
            <button className="btn block" disabled={tutor.busy || !!result || tutor.level >= 5} onClick={() => askTutor('Please give me a hint')}>{tutor.level === 0 ? 'Give me a hint' : 'Next hint'}</button>
            <form className="row" style={{ marginTop: '.6rem', flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (ask.trim()) askTutor(ask.trim()); }}>
              <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Or type your own question" disabled={tutor.busy || !!result} aria-label="Question for the tutor" />
              <button className="btn" disabled={tutor.busy || !ask.trim() || !!result}>Send</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
