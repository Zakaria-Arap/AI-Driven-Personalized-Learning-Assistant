import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import GoogleButton from './GoogleButton.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import Icon from '../../components/Icon.jsx';
import { authApi } from '../../api/endpoints.js';
import { useAuth, HOME } from '../../context/AuthContext.jsx';

export default function Login() {
  const nav = useNavigate();
  const { setUser, notice, clearNotice } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(null); setBusy(true); clearNotice();
    try {
      const r = await authApi.login(userCode, password);
      if (r.mustActivate) return nav('/activate', { state: { userCode, tempPassword: password } });
      setUser(r.user); nav(HOME[r.user.role]);
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  async function google(idToken) {
    try { const r = await authApi.google(idToken); setUser(r.user); nav(HOME[r.user.role]); }
    catch (err) { err.code === 'NOT_REGISTERED' ? nav('/google-not-registered') : setError(err); }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Use the school ID your school gave you." footer={<Link to="/forgot">Forgot password?</Link>}>
      {notice && <div className="info" role="status">{notice}</div>}
      <form onSubmit={submit} className="stack">
        <label>School ID<input value={userCode} onChange={(e) => setUserCode(e.target.value)} autoComplete="username" placeholder="e.g. AMA-10B-014" required autoFocus /></label>
        <label>Password
          <span className="row" style={{ flexWrap: 'nowrap' }}>
            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            <button type="button" className="iconbtn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name={show ? 'eyeoff' : 'eye'} size={18} /></button>
          </span>
        </label>
        <ErrorNote error={error} />
        <button className="btn primary block" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <GoogleButton onCredential={google} />
    </AuthLayout>
  );
}
