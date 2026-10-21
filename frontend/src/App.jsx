import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';
import { useAuth, HOME } from './context/AuthContext.jsx';
import Welcome from './pages/Welcome.jsx';
import Login from './pages/auth/Login.jsx';
import Activate from './pages/auth/Activate.jsx';
import Forgot from './pages/auth/Forgot.jsx';
import Code from './pages/auth/Code.jsx';
import Reset from './pages/auth/Reset.jsx';
import GoogleNotRegistered from './pages/auth/GoogleNotRegistered.jsx';
import LearnerDashboard from './pages/learner/Dashboard.jsx';
import Practice from './pages/learner/Practice.jsx';
import Subjects from './pages/learner/Subjects.jsx';
import Reviews from './pages/learner/Reviews.jsx';
import Achievements from './pages/learner/Achievements.jsx';
import TeacherOverview from './pages/teacher/Overview.jsx';
import Assignments from './pages/teacher/Assignments.jsx';
import Flagged from './pages/teacher/Flagged.jsx';
import Children from './pages/parent/Children.jsx';
import PrincipalOverview from './pages/principal/Overview.jsx';
import Accounts from './pages/admin/Accounts.jsx';
import AdminSubjects from './pages/admin/Subjects.jsx';
import ParentLinks from './pages/admin/ParentLinks.jsx';
import Audit from './pages/admin/Audit.jsx';
import Profile from './pages/shared/Profile.jsx';
import Branding from './pages/shared/Branding.jsx';
import Announcements from './pages/shared/Announcements.jsx';
import Notifications from './pages/shared/Notifications.jsx';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to={HOME[user.role]} replace /> : <Welcome />;
}
const R = (roles, el) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/forgot/code" element={<Code />} />
      <Route path="/forgot/reset" element={<Reset />} />
      <Route path="/google-not-registered" element={<GoogleNotRegistered />} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/learner" element={R(['learner'], <LearnerDashboard />)} />
        <Route path="/learner/practice/:topicId" element={R(['learner'], <Practice />)} />
        <Route path="/learner/subjects" element={R(['learner'], <Subjects />)} />
        <Route path="/learner/reviews" element={R(['learner'], <Reviews />)} />
        <Route path="/learner/achievements" element={R(['learner'], <Achievements />)} />
        <Route path="/teacher" element={R(['teacher'], <TeacherOverview />)} />
        <Route path="/teacher/assignments" element={R(['teacher'], <Assignments />)} />
        <Route path="/teacher/flagged" element={R(['teacher'], <Flagged />)} />
        <Route path="/parent" element={R(['parent'], <Children />)} />
        <Route path="/principal" element={R(['principal'], <PrincipalOverview />)} />
        <Route path="/principal/branding" element={R(['principal'], <Branding />)} />
        <Route path="/admin" element={R(['admin'], <Accounts />)} />
        <Route path="/admin/subjects" element={R(['admin'], <AdminSubjects />)} />
        <Route path="/admin/links" element={R(['admin'], <ParentLinks />)} />
        <Route path="/admin/branding" element={R(['admin'], <Branding />)} />
        <Route path="/admin/audit" element={R(['admin'], <Audit />)} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
