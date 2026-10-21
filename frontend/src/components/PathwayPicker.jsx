import { useState } from 'react';
import ErrorNote from './ErrorNote.jsx';

// Choose a pathway and up to 3 electives from it. Used by learners (their own choice) and admins (on a learner's behalf).
export default function PathwayPicker({ options, onSave, saveLabel = 'Save my subjects' }) {
  const [pathway, setPathway] = useState(options.pathway || options.pathways[0].key);
  const [picked, setPicked] = useState(options.pathway ? options.chosen : []);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const path = options.pathways.find((p) => p.key === pathway);
  const toggle = (code) => setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : p.length < options.maxElectives ? [...p, code] : p));
  async function save() {
    setError(null); setBusy(true);
    try { await onSave(pathway, picked); } catch (e) { setError(e); } finally { setBusy(false); }
  }
  return (
    <div className="stack">
      <p className="muted small">Everyone studies {options.compulsory.map((c) => c.name).join(', ')}. Choose a pathway, then up to {options.maxElectives} subjects from it.</p>
      <div className="seg" role="radiogroup" aria-label="Pathway">
        {options.pathways.map((p) => <button key={p.key} type="button" role="radio" aria-checked={pathway === p.key} className={pathway === p.key ? 'on' : ''} onClick={() => { setPathway(p.key); setPicked([]); }}>{p.name}</button>)}
      </div>
      <div className="optgrid">
        {path.electives.map((c) => (
          <label key={c.code} className="check"><input type="checkbox" checked={picked.includes(c.code)} onChange={() => toggle(c.code)} disabled={!picked.includes(c.code) && picked.length >= options.maxElectives} />
            <span><b>{c.name}</b>{c.teacher && <span className="small muted"><br />{c.teacher.name}</span>}</span></label>
        ))}
      </div>
      <p className="small muted">{picked.length} of {options.maxElectives} chosen</p>
      <ErrorNote error={error} />
      <button className="btn primary" disabled={!picked.length || busy} onClick={save}>{saveLabel}</button>
    </div>
  );
}
