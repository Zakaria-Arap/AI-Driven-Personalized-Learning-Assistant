import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { PasswordRules, passwordOk } from '../../components/PasswordField.jsx';
import { authApi } from '../../api/endpoints.js';
import { useAuth, HOME } from '../../context/AuthContext.jsx';

export default function Activate() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [pw, setPw] = useState('');
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState(null);
  if (!state?.userCode) return <Navigate to="/login" replace />;
  async function submit(e) {
    e.preventDefault(); setError(null);
    try { const r = await authApi.activate({ userCode: state.userCode, tempPassword: state.tempPassword, newPassword: pw, acceptPolicy: accept }); setUser(r.user); nav(HOME[r.user.role]); }
    catch (err) { setError(err); }
  }
  return (
    <AuthLayout title="Activate your account" subtitle={`Welcome, ${state.userCode}. Choose your own password to continue.`}>
      <form onSubmit={submit} className="stack">
        <label>New password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required autoFocus /></label>
        <PasswordRules password={pw} />
        <label className="check"><input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} /> I have read the school data policy and agree to it.</label>
        <ErrorNote error={error} />
        <button className="btn primary block" disabled={!passwordOk(pw) || !accept}>Activate and continue</button>
      </form>
    </AuthLayout>
  );
}
