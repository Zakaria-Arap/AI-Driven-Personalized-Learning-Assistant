import { useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import Avatar from '../../components/Avatar.jsx';
import Modal from '../../components/Modal.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import PathwayPicker from '../../components/PathwayPicker.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import useLoad from '../../components/useLoad.js';
import { adminApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';

const ROLES = ['learner', 'teacher', 'parent', 'principal', 'admin'];
const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const head = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((l) => { const c = l.split(','); const o = {}; head.forEach((h, i) => { const v = (c[i] || '').trim(); if (v !== '') o[h] = h === 'grade' ? Number(v) : v; }); return o; });
}

function TempShown({ info, onClose }) {
  const toast = useToast();
  return (
    <Modal title="Account ready" onClose={onClose}>
      <p>Give these sign-in details to <b>{info.user.fullName}</b>. The password is shown <b>only once</b>.</p>
      <div className="card flat"><div className="small muted">School ID</div><b style={{ fontSize: '1.2rem' }}>{info.user.userCode}</b><div className="small muted" style={{ marginTop: '.6rem' }}>Temporary password</div><b style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{info.tempPassword}</b></div>
      <div className="row"><button className="btn" onClick={() => { navigator.clipboard?.writeText(`School ID: ${info.user.userCode}\nTemporary password: ${info.tempPassword}`); toast('Copied'); }}>Copy</button><button className="btn primary" onClick={onClose}>Done</button></div>
    </Modal>
  );
}

function IssueModal({ onClose, onDone }) {
  const [f, setF] = useState({ fullName: '', role: 'learner', email: '', classLabel: '', grade: 10 });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function go(e) {
    e.preventDefault(); setError(null);
    try {
      const body = { fullName: f.fullName, role: f.role };
      if (f.email) body.email = f.email;
      if (f.classLabel) body.classLabel = f.classLabel;
      if (f.role === 'learner') body.grade = Number(f.grade);
      onDone(await adminApi.issue(body));
    } catch (err) { setError(err); }
  }
  return (
    <Modal title="Issue an account" onClose={onClose}>
      <form className="stack" onSubmit={go}>
        <label>Full name<input value={f.fullName} onChange={set('fullName')} required minLength={3} /></label>
        <label>Role<select value={f.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
        <label>Email (optional, needed for Google sign-in)<input type="email" value={f.email} onChange={set('email')} /></label>
        {(f.role === 'learner' || f.role === 'teacher') && <label>Class (for example 10B)<input value={f.classLabel} onChange={set('classLabel')} /></label>}
        <ErrorNote error={error} /><button className="btn primary">Create account</button>
      </form>
    </Modal>
  );
}

function SubjectsModal({ u, onClose, onDone }) {
  const [opts, setOpts] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { adminApi.learnerSubjects(u.id).then(setOpts).catch(setError); }, [u.id]);
  return (
    <Modal title={`Subjects for ${u.fullName}`} onClose={onClose} wide>
      <ErrorNote error={error} />
      {opts ? <PathwayPicker options={opts} saveLabel="Save subjects" onSave={async (pathway, codes) => { await adminApi.setLearnerSubjects(u.id, pathway, codes); onDone(); }} /> : !error && <p className="muted">Loading...</p>}
    </Modal>
  );
}

function BulkModal({ onClose, onDone }) {
  const [rows, setRows] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const sample = 'fullName,role,classLabel,grade,email\nJane Wanjiru,learner,10B,10,\nPeter Otieno,teacher,10B,,peter@school.ac.ke\n';
  async function run() {
    setError(null);
    try { const r = await adminApi.bulk(rows); setResults(r.results); onDone(); } catch (e) { setError(e); }
  }
  const csvOut = () => download('issued-accounts.csv', 'fullName,role,userCode,tempPassword,status\n' + results.map((r) => `${r.fullName},${r.role},${r.userCode || ''},${r.tempPassword || ''},${r.ok ? 'ok' : r.error}`).join('\n'));
  return (
    <Modal title="Import accounts from CSV" onClose={onClose} wide>
      {!results ? (
        <div className="stack">
          <p className="muted">Columns: <code>fullName, role, classLabel, grade, email</code>. Up to 300 rows. Passwords are generated for you.</p>
          <div className="row"><button className="btn sm" onClick={() => download('accounts-template.csv', sample)}><Icon name="download" size={16} />Template</button>
            <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files[0]; if (f) setRows(parseCsv(await f.text())); }} /></div>
          {rows && <p><b>{rows.length}</b> row{rows.length === 1 ? '' : 's'} ready.</p>}
          <ErrorNote error={error} />
          <button className="btn primary" disabled={!rows?.length} onClick={run}>Create {rows?.length || 0} accounts</button>
        </div>
      ) : (
        <div className="stack">
          <p><b>{results.filter((r) => r.ok).length}</b> created, <b>{results.filter((r) => !r.ok).length}</b> failed. Download the list now: passwords are not shown again.</p>
          <div className="tablewrap" style={{ maxHeight: 280 }}><table><thead><tr><th>Name</th><th>Role</th><th>School ID</th><th>Result</th></tr></thead><tbody>{results.map((r, i) => <tr key={i}><td>{r.fullName}</td><td>{r.role}</td><td>{r.userCode || '-'}</td><td>{r.ok ? <span className="chip nearly_there">Created</span> : <span className="chip learning" title={r.error}>{r.error}</span>}</td></tr>)}</tbody></table></div>
          <div className="row"><button className="btn primary" onClick={csvOut}><Icon name="download" size={16} />Download CSV</button><button className="btn" onClick={onClose}>Close</button></div>
        </div>
      )}
    </Modal>
  );
}

function EditModal({ u, onClose, onDone }) {
  const [f, setF] = useState({ fullName: u.fullName, email: u.email || '', classLabel: u.classLabel || '' });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={`Edit ${u.userCode}`} onClose={onClose}>
      <form className="stack" onSubmit={async (e) => { e.preventDefault(); try { await adminApi.edit(u.id, f); onDone(); } catch (err) { setError(err); } }}>
        <label>Full name<input value={f.fullName} onChange={set('fullName')} required /></label>
        <label>Email<input type="email" value={f.email} onChange={set('email')} /></label>
        <label>Class<input value={f.classLabel} onChange={set('classLabel')} /></label>
        <ErrorNote error={error} /><button className="btn primary">Save</button>
      </form>
    </Modal>
  );
}

export default function Accounts() {
  const toast = useToast();
  const [q, setQ] = useState(''); const [role, setRole] = useState(''); const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const { data, error, reload } = useLoad(() => adminApi.users({ q, role, page, pageSize: 12 }), [q, role, page]);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const act = async (fn, msg) => { try { await fn(); toast(msg); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <>
      <div className="pagehead"><div><h2>Accounts</h2><p>No public sign-up. The school issues every account.</p></div>
        <div className="row"><button className="btn" onClick={() => setModal({ t: 'bulk' })}><Icon name="upload" size={18} />Import CSV</button><button className="btn primary" onClick={() => setModal({ t: 'issue' })}><Icon name="plus" size={18} />Issue account</button></div></div>
      <section className="card">
        <div className="row"><input style={{ flex: 1, minWidth: 180 }} placeholder="Search name, ID or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search accounts" />
          <select style={{ width: 'auto' }} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Filter by role"><option value="">All roles</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
        <ErrorNote error={error} />
        {!data ? <Skeleton h={240} style={{ marginTop: 12 }} /> : (
          <div className="tablewrap"><table><thead><tr><th>Person</th><th>School ID</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>{data.users.map((u) => (
              <tr key={u.id}><td><div className="row"><Avatar user={u} /><div><b>{u.fullName}</b><div className="small muted">{u.email || 'no email'}{u.classLabel ? ` · ${u.classLabel}` : ''}</div></div></div></td>
                <td><code>{u.userCode}</code></td><td>{u.role}</td>
                <td>{!u.active ? <span className="chip not_started">Disabled</span> : u.mustActivate ? <span className="chip learning">Awaiting activation</span> : <span className="chip nearly_there">Active</span>}</td>
                <td><div className="row" style={{ flexWrap: 'nowrap' }}>
                  <button className="iconbtn" title="Edit" aria-label={`Edit ${u.fullName}`} onClick={() => setModal({ t: 'edit', u })}><Icon name="edit" size={18} /></button>
                  {u.role === 'learner' && <button className="iconbtn" title="Pathway and subjects" aria-label={`Subjects for ${u.fullName}`} onClick={() => setModal({ t: 'subjects', u })}><Icon name="book" size={18} /></button>}
                  <button className="iconbtn" title="New temporary password" aria-label="Reset password" onClick={async () => { if (confirm(`Issue a new temporary password for ${u.fullName}?`)) { try { setModal({ t: 'temp', info: await adminApi.resetPassword(u.id) }); } catch (e) { toast(e.message, 'error'); } } }}><Icon name="lock" size={18} /></button>
                  <button className="btn sm" onClick={() => act(() => adminApi.setActive(u.id, !u.active), u.active ? 'Account disabled' : 'Account enabled')}>{u.active ? 'Disable' : 'Enable'}</button></div></td></tr>
            ))}</tbody></table></div>
        )}
        {data && data.users.length === 0 && <p className="muted center">No accounts match.</p>}
        <div className="row between" style={{ marginTop: '.8rem' }}><span className="small muted">{data ? `${data.total} account${data.total === 1 ? '' : 's'}` : ''}</span>
          <div className="row"><button className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="small">Page {page} of {pages}</span><button className="btn sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div></div>
      </section>
      {modal?.t === 'issue' && <IssueModal onClose={() => setModal(null)} onDone={(info) => { setModal({ t: 'temp', info }); reload(); }} />}
      {modal?.t === 'bulk' && <BulkModal onClose={() => setModal(null)} onDone={reload} />}
      {modal?.t === 'edit' && <EditModal u={modal.u} onClose={() => setModal(null)} onDone={() => { setModal(null); toast('Saved'); reload(); }} />}
      {modal?.t === 'subjects' && <SubjectsModal u={modal.u} onClose={() => setModal(null)} onDone={() => { setModal(null); toast('Subjects saved'); reload(); }} />}
      {modal?.t === 'temp' && <TempShown info={modal.info} onClose={() => setModal(null)} />}
    </>
  );
}
