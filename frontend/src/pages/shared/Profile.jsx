import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import Avatar from '../../components/Avatar.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PasswordRules, passwordOk } from '../../components/PasswordField.jsx';
import useLoad from '../../components/useLoad.js';
import { profileApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fileToDataUrl } from './imageTools.js';

const TABS = [['about', 'About me', 'user'], ['prefs', 'Preferences', 'sparkle'], ['security', 'Security', 'lock'], ['help', 'Help and privacy', 'help']];
const Seg = ({ value, options, onChange, label }) => <div className="seg" role="group" aria-label={label}>{options.map(([v, l]) => <button key={v} type="button" className={value === v ? 'on' : ''} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>;

function About() {
  const { user, setUser } = useAuth(); const toast = useToast(); const fileRef = useRef(null);
  const [f, setF] = useState({ preferredName: user.preferredName || '', phone: user.phone || '', bio: user.bio || '', email: user.email || '' });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault(); setError(null);
    try { const r = await profileApi.update(f); setUser(r.user); toast('Profile saved'); } catch (x) { setError(x); }
  }
  async function pick(e) {
    const file = e.target.files[0]; if (!file) return;
    try { const r = await profileApi.setAvatar(await fileToDataUrl(file, 320, true)); setUser(r.user); toast('Photo updated'); } catch (x) { toast(x.message, 'error'); }
    e.target.value = '';
  }
  return (
    <div className="grid g21">
      <form className="card stack" onSubmit={save}>
        <h3>About me</h3>
        <label>Full name (set by the school)<input value={user.fullName} disabled /></label>
        <label>Name to show<input value={f.preferredName} onChange={set('preferredName')} maxLength={80} placeholder="What should we call you?" /></label>
        <label>Email<input type="email" value={f.email} onChange={set('email')} /></label>
        <label>Phone<input value={f.phone} onChange={set('phone')} maxLength={30} /></label>
        <label>A line about me<textarea rows={3} value={f.bio} onChange={set('bio')} maxLength={280} /><span className="small muted">{f.bio.length}/280</span></label>
        <ErrorNote error={error} /><button className="btn primary">Save</button>
      </form>
      <section className="card stack center" style={{ alignSelf: 'start', justifyItems: 'center' }}>
        <Avatar user={user} size="lg" />
        <div><b>{user.displayName}</b><div className="small muted">{user.role} &middot; {user.userCode}{user.classLabel ? ` · ${user.classLabel}` : ''}</div></div>
        <div className="row"><button className="btn" onClick={() => fileRef.current.click()}><Icon name="upload" size={18} />Change photo</button>
          {user.avatarUrl && <button className="btn danger" onClick={async () => { setUser((await profileApi.removeAvatar()).user); toast('Photo removed'); }}>Remove</button>}</div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pick} />
        <p className="small muted">Your photo is cropped to a square and resized on your device.</p>
      </section>
    </div>
  );
}

function Prefs() {
  const { user, setUser } = useAuth(); const toast = useToast();
  const p = user.prefs;
  const save = async (patch, top) => {
    setUser((u) => ({ ...u, ...(top || {}), prefs: { ...u.prefs, ...(patch || {}), notify: { ...u.prefs.notify, ...((patch || {}).notify || {}) } } })); // instant
    try { await profileApi.update({ ...(top || {}), ...(patch ? { prefs: patch } : {}) }); toast('Saved'); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div className="grid g2">
      <section className="card stack"><h3>Appearance</h3>
        <div><div className="small muted">Mode</div><Seg label="Mode" value={p.theme} onChange={(v) => save({ theme: v })} options={[['system', 'Device'], ['light', 'Light'], ['dark', 'Dark']]} /></div>
        <div><div className="small muted">Text size</div><Seg label="Text size" value={String(p.fontScale)} onChange={(v) => save({ fontScale: Number(v) })} options={[['90', 'Small'], ['100', 'Normal'], ['115', 'Large'], ['130', 'Extra large']]} /></div>
        <div><div className="small muted">Spacing</div><Seg label="Spacing" value={p.density} onChange={(v) => save({ density: v })} options={[['comfortable', 'Comfortable'], ['compact', 'Compact']]} /></div>
        <label className="switch"><input type="checkbox" checked={p.reducedMotion} onChange={(e) => save({ reducedMotion: e.target.checked })} />Reduce animation</label>
        <div><div className="small muted">Language</div><Seg label="Language" value={user.language} onChange={(v) => save(null, { language: v })} options={[['en', 'English'], ['sw', 'Kiswahili']]} /></div>
      </section>
      <section className="card stack"><h3>Notifications</h3>
        {[['announcements', 'School announcements'], ['assignments', 'New tasks from my teacher'], ['badges', 'Badges and streak news']].map(([k, l]) => <label key={k} className="switch"><input type="checkbox" checked={p.notify[k]} onChange={(e) => save({ notify: { [k]: e.target.checked } })} />{l}</label>)}
        {user.role === 'learner' && <><h3 style={{ marginTop: '.8rem' }}>Daily goal</h3><div className="row"><input type="range" min="1" max="20" value={p.dailyGoal} onChange={(e) => setUser((u) => ({ ...u, prefs: { ...u.prefs, dailyGoal: Number(e.target.value) } }))} onMouseUp={(e) => save({ dailyGoal: Number(e.target.value) })} onTouchEnd={(e) => save({ dailyGoal: Number(e.target.value) })} onKeyUp={(e) => save({ dailyGoal: Number(e.target.value) })} aria-label="Daily goal" style={{ flex: 1 }} /><b>{p.dailyGoal} questions a day</b></div></>}
      </section>
    </div>
  );
}

function Security() {
  const toast = useToast();
  const sessions = useLoad(() => profileApi.sessions());
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState(null);
  async function change(e) {
    e.preventDefault(); setError(null);
    try { await profileApi.password(f.currentPassword, f.newPassword); toast('Password changed. Other devices were signed out.'); setF({ currentPassword: '', newPassword: '' }); sessions.reload(); } catch (x) { setError(x); }
  }
  return (
    <div className="grid g2">
      <form className="card stack" onSubmit={change}><h3>Change password</h3>
        <label>Current password<input type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} required /></label>
        <label>New password<input type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} required /></label>
        <PasswordRules password={f.newPassword} /><ErrorNote error={error} />
        <button className="btn primary" disabled={!passwordOk(f.newPassword)}>Change password</button>
      </form>
      <section className="card stack"><div className="row between"><h3 style={{ margin: 0 }}>Where you are signed in</h3>
        {sessions.data?.sessions.length > 1 && <button className="btn sm" onClick={async () => { await profileApi.revokeOthers(); toast('Signed out everywhere else'); sessions.reload(); }}>Sign out other devices</button>}</div>
        <ul className="list">{sessions.data?.sessions.map((s) => (
          <li key={s.id}><div><Icon name="device" size={18} /> <b>{s.device}</b> {s.current && <span className="chip nearly_there">This device</span>}<div className="small muted">Last active {new Date(s.lastSeenAt).toLocaleString()}</div></div>
            {!s.current && <button className="btn sm danger" onClick={async () => { await profileApi.revoke(s.id); sessions.reload(); }}>Sign out</button>}</li>))}</ul>
      </section>
    </div>
  );
}

function Help() {
  return (
    <div className="grid g2">
      <section className="card stack"><h3>Your privacy</h3>
        <p>Your school issued this account. Your answers and progress are used to plan your learning and are visible to your teacher.</p>
        <p>Tutor chats are private to you. A teacher can open a chat only if the system flagged it for safety. A parent can read chats only if the school has recorded consent.</p>
        <p>You can change your photo, name and preferences at any time. To correct your official name or class, ask the school office.</p></section>
      <section className="card stack"><h3>Keyboard shortcuts</h3>
        <p><kbd>Ctrl</kbd> + <kbd>K</kbd> opens quick search to jump to any page.</p>
        <p><kbd>Esc</kbd> closes menus and dialogs.</p>
        <h3>Need help?</h3><p>Ask your teacher or the school office. They can issue a new temporary password if you are locked out.</p></section>
    </div>
  );
}

export default function Profile() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t[0] === params.get('tab')) ? params.get('tab') : 'about';
  return (
    <>
      <div className="pagehead"><div><h2>My profile</h2><p>Make the app yours.</p></div></div>
      <div className="tabs" role="tablist">{TABS.map(([id, label, icon]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setParams({ tab: id })}><Icon name={icon} size={16} /> {label}</button>)}</div>
      {tab === 'about' && <About />}{tab === 'prefs' && <Prefs />}{tab === 'security' && <Security />}{tab === 'help' && <Help />}
    </>
  );
}
