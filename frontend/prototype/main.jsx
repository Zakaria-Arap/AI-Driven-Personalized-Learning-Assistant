import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { ThemeProvider } from '../src/context/ThemeContext.jsx';
import { I18nProvider } from '../src/context/I18nContext.jsx';
import { ToastProvider } from '../src/context/ToastContext.jsx';
import { handle, resetDemo } from './mock/server.js';
import '../src/styles/global.css';
import './proto.css';

const QUICK = [['LEARNER', 'learner@1234', 'Learner'], ['TEACHER', 'teacher@1234', 'Teacher'], ['PARENT', 'parent@1234', 'Parent'], ['PRINCIPAL', 'principal@1234', 'Principal'], ['ADMIN', 'admin@1234', 'Admin']];

function DemoBar() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(null);
  useEffect(() => { const f = (e) => setCode(e.detail); window.addEventListener('somo-demo-code', f); return () => window.removeEventListener('somo-demo-code', f); }, []);
  const go = (u, p) => { try { handle('POST', '/auth/logout'); } catch { /* none */ } handle('POST', '/auth/login', { userCode: u, password: p }); location.hash = '#/'; location.reload(); };
  return (
    <div className="demobar">
      {code && <div className="democode" role="status">Demo: your reset code is <b>{code}</b> <button onClick={() => setCode(null)} aria-label="Dismiss">x</button></div>}
      {open && (
        <div className="demopanel">
          <b>Somo design prototype</b>
          <p>Same screens as the real app, with a fake server in your browser. Nothing leaves this page.</p>
          <div className="demochips">{QUICK.map(([u, p, l]) => <button key={u} onClick={() => go(u, p)}>{l}</button>)}</div>
          <p className="small">First-login demo: <code>AMA-10B-014</code> / <code>Welcome-2026</code>. Reset code: <code>482917</code>.</p>
          <button className="reset" onClick={() => { if (confirm('Reset all demo data?')) { resetDemo(); location.hash = '#/'; location.reload(); } }}>Reset demo data</button>
        </div>
      )}
      <button className="demotoggle" onClick={() => setOpen(!open)} aria-expanded={open}>PROTOTYPE</button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider><ThemeProvider><I18nProvider><ToastProvider><App /><DemoBar /></ToastProvider></I18nProvider></ThemeProvider></AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
