import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { authApi } from '../../api/endpoints.js';

export default function Code() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  if (!state?.userCode) return <Navigate to="/forgot" replace />;
  async function submit(e) { e.preventDefault(); setError(null); try { const r = await authApi.verifyCode(state.userCode, code); nav('/forgot/reset', { state: { resetToken: r.resetToken } }); } catch (err) { setError(err); } }
  return (
    <AuthLayout title="Enter your code" subtitle="Type the 6-digit code. It works for 10 minutes.">
      <form onSubmit={submit} className="stack">
        <label>6-digit code<input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} style={{ letterSpacing: '.4em', fontSize: '1.4rem', textAlign: 'center' }} required autoFocus /></label>
        <ErrorNote error={error} />
        <button className="btn primary block" disabled={code.length !== 6}>Verify</button>
      </form>
    </AuthLayout>
  );
}
