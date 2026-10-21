import { Link } from 'react-router-dom';
import { Brand } from '../../components/AppShell.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

// Split screen: school-branded art on the left, the form on the right. Stacks on phones.
export default function AuthLayout({ title, subtitle, children, footer }) {
  const { branding } = useTheme();
  return (
    <div className="authpage">
      <div className="authart">
        <Link to="/" className="row" style={{ color: 'inherit', textDecoration: 'none' }}><Brand branding={branding} /><b style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem' }}>{branding.name}</b></Link>
        <div><h1>Maths that adapts to you.</h1><p className="tag" style={{ opacity: .85, maxWidth: '36ch' }}>{branding.tagline || 'Practise a little every day, get hints when you are stuck, and watch your streak grow.'}</p></div>
        <small className="tag" style={{ opacity: .7 }}>Provided through your school. Your school office issues your login.</small>
      </div>
      <div className="authform">
        <div className="authbox">
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {children}
          {footer && <p className="center small">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
