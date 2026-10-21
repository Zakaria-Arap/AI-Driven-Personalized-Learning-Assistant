import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
export default function GoogleNotRegistered() {
  return (
    <AuthLayout title="This Google account is not registered" subtitle="Your school has not added this email. Sign in with your school ID, or ask the school office to register your email.">
      <Link className="btn primary block" to="/login">Sign in with school ID</Link>
    </AuthLayout>
  );
}
