import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { Brand } from '../../components/AppShell.jsx';
import { useTheme, PRESETS } from '../../context/ThemeContext.jsx';
import { settingsApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { fileToDataUrl } from './imageTools.js';

// WCAG contrast of white text on a colour (mirrors the server rule: at least 4.5).
function contrastWithWhite(hex) {
  const c = hex.replace('#', ''); if (c.length !== 6) return 21;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}
const Seg = ({ value, options, onChange, label }) => <div className="seg" role="group" aria-label={label}>{options.map(([v, l]) => <button key={v} type="button" className={value === v ? 'on' : ''} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>;

export default function Branding() {
  const { saved, preview, reload } = useTheme();
  const toast = useToast();
  const [f, setF] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => { if (!f) setF({ name: saved.name, tagline: saved.tagline, footerText: saved.footerText, supportEmail: saved.supportEmail, primaryColor: saved.primaryColor, accentColor: saved.accentColor, defaultMode: saved.defaultMode, radius: saved.radius, fontStyle: saved.fontStyle }); }, [saved, f]);
  useEffect(() => { if (f) preview(f); }, [f, preview]);
  useEffect(() => () => preview(null), [preview]);
  const ratio = useMemo(() => (f ? contrastWithWhite(f.primaryColor) : 21), [f]);
  if (!f) return null;
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v && v.target ? v.target.value : v }));
  const low = ratio < 4.5;

  async function save() {
    setError(null); setBusy(true);
    try { await settingsApi.save(f); await reload(); toast('Branding saved for everyone at your school'); } catch (e) { setError(e); } finally { setBusy(false); }
  }
  async function logo(e) {
    const file = e.target.files[0]; if (!file) return;
    try { await settingsApi.setLogo(await fileToDataUrl(file, 256)); await reload(); toast('Logo updated'); } catch (x) { toast(x.message, 'error'); }
    e.target.value = '';
  }
  return (
    <>
      <div className="pagehead"><div><h2>School branding</h2><p>Changes preview live. Press Save to apply them for every learner, parent and teacher.</p></div>
        <div className="row"><button className="btn" onClick={() => { preview(null); setF(null); }}>Discard</button><button className="btn primary" disabled={busy || low} onClick={save}>{busy ? 'Saving...' : 'Save changes'}</button></div></div>
      <ErrorNote error={error} />
      <div className="grid g21">
        <div className="stack">
          <section className="card stack"><h3>Identity</h3>
            <div className="row"><Brand branding={saved} size={64} />
              <div className="row"><button className="btn" onClick={() => fileRef.current.click()}><Icon name="upload" size={18} />Upload logo</button>
                {saved.logoUrl && <button className="btn danger" onClick={async () => { await settingsApi.removeLogo(); await reload(); toast('Logo removed'); }}>Remove</button>}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={logo} /></div></div>
            <p className="small muted">PNG, JPG or WebP, resized for you. SVG is not accepted for safety.</p>
            <label>School name<input value={f.name} onChange={set('name')} maxLength={80} /></label>
            <label>Tagline<input value={f.tagline} onChange={set('tagline')} maxLength={160} /></label>
            <label>Footer text<input value={f.footerText} onChange={set('footerText')} maxLength={200} /></label>
            <label>Support email<input type="email" value={f.supportEmail} onChange={set('supportEmail')} /></label>
          </section>
          <section className="card stack"><h3>Colours</h3>
            <div className="row">{PRESETS.map((p) => <button key={p.id} type="button" className="btn sm" onClick={() => setF((s) => ({ ...s, primaryColor: p.primaryColor, accentColor: p.accentColor }))}><span style={{ width: 16, height: 16, borderRadius: 4, background: p.primaryColor, display: 'inline-block' }} /><span style={{ width: 16, height: 16, borderRadius: 4, background: p.accentColor, display: 'inline-block' }} />{p.name}</button>)}</div>
            <div className="grid g2">
              <label>Main colour<div className="row"><input type="color" value={f.primaryColor} onChange={set('primaryColor')} style={{ width: 56, padding: 2 }} aria-label="Main colour" /><input value={f.primaryColor} onChange={set('primaryColor')} maxLength={7} /></div></label>
              <label>Accent colour<div className="row"><input type="color" value={f.accentColor} onChange={set('accentColor')} style={{ width: 56, padding: 2 }} aria-label="Accent colour" /><input value={f.accentColor} onChange={set('accentColor')} maxLength={7} /></div></label>
            </div>
            {low ? <div className="error" role="alert">This main colour is too light for white text (contrast {ratio.toFixed(1)}:1, needs 4.5:1). Choose a darker one so buttons stay readable.</div> : <div className="info small"><Icon name="check" size={16} /> Readable: contrast {ratio.toFixed(1)}:1 with white text.</div>}
          </section>
          <section className="card stack"><h3>Look and feel</h3>
            <div><div className="small muted">Default mode</div><Seg label="Default mode" value={f.defaultMode} onChange={set('defaultMode')} options={[['light', 'Light'], ['dark', 'Dark'], ['system', 'Follow device']]} /></div>
            <div><div className="small muted">Corners</div><Seg label="Corners" value={f.radius} onChange={set('radius')} options={[['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']]} /></div>
            <div><div className="small muted">Font</div><Seg label="Font" value={f.fontStyle} onChange={set('fontStyle')} options={[['classic', 'Classic'], ['modern', 'Modern'], ['friendly', 'Friendly']]} /></div>
            <p className="small muted">Learners can still choose their own light or dark mode, text size and density in their profile.</p>
          </section>
        </div>
        <section className="card stack" style={{ alignSelf: 'start', position: 'sticky', top: 80 }}><h3>Live preview</h3>
          <div className="row"><Brand branding={{ ...saved, name: f.name }} /><div><b>{f.name}</b><div className="small muted">{f.tagline}</div></div></div>
          <button className="btn primary">Primary button</button><button className="btn">Secondary button</button>
          <div className="row"><span className="chip mastered">Mastered</span><span className="chip nearly_there">Nearly there</span><span className="chip learning">Learning</span></div>
          <div className="bar"><i style={{ width: '68%' }} /></div>
          <div className="info small">The whole app, including this page, is already using your choices.</div>
        </section>
      </div>
    </>
  );
}
