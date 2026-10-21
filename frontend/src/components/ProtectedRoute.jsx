import { Navigate } from 'react-router-dom';
import { useAuth, HOME } from '../context/AuthContext.jsx';
import { PageSkeleton } from './Skeleton.jsx';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="content"><PageSkeleton /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME[user.role]} replace />;
  return children;
}
