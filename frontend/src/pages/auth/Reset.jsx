import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PasswordRules, passwordOk } from '../../components/PasswordField.jsx';
import { authApi } from '../../api/endpoints.js';

export default function Reset() {
  const { state } = useLocation();
  const [pw, setPw] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  if (!state?.resetToken) return <Navigate to="/forgot" replace />;
  async function submit(e) { e.preventDefault(); setError(null); try { await authApi.reset(state.resetToken, pw); setDone(true); } catch (err) { setError(err); } }
  if (done) return <AuthLayout title="Password changed" subtitle="You can sign in with your new password."><Link className="btn primary block" to="/login">Go to sign in</Link></AuthLayout>;
  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={submit} className="stack">
        <label>New password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required autoFocus /></label>
        <PasswordRules password={pw} />
        <ErrorNote error={error} />
        <button className="btn primary block" disabled={!passwordOk(pw)}>Save password</button>
      </form>
    </AuthLayout>
  );
}
