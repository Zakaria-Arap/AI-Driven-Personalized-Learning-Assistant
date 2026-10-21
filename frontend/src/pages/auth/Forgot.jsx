import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import ErrorNote from '../../components/ErrorNote.jsx';
import { authApi } from '../../api/endpoints.js';

export default function Forgot() {
  const nav = useNavigate();
  const [userCode, setUserCode] = useState('');
  const [error, setError] = useState(null);
  async function submit(e) { e.preventDefault(); setError(null); try { await authApi.forgot(userCode); nav('/forgot/code', { state: { userCode } }); } catch (err) { setError(err); } }
  return (
    <AuthLayout title="Forgot password" subtitle="Enter your school ID. If it has an email on file, we send a 6-digit code there." footer={<Link to="/login">Back to sign in</Link>}>
      <form onSubmit={submit} className="stack">
        <label>School ID<input value={userCode} onChange={(e) => setUserCode(e.target.value)} required autoFocus /></label>
        <ErrorNote error={error} />
        <button className="btn primary block">Send code</button>
      </form>
    </AuthLayout>
  );
}
