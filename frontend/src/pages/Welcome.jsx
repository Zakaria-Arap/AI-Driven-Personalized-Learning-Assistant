import { Link } from 'react-router-dom';
import AuthLayout from './auth/AuthLayout.jsx';
export default function Welcome() {
  return (
    <AuthLayout title="Welcome" subtitle="There is no public sign-up. Your school gives you a school ID and a temporary password.">
      <Link className="btn primary block" to="/login">Sign in with your school ID</Link>
      <p className="muted small center">No ID yet? Ask your school office.</p>
    </AuthLayout>
  );
}
