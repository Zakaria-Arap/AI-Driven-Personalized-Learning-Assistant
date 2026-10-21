import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

// Google Identity Services button. Shown only when the server has GOOGLE_CLIENT_ID set.
export default function GoogleButton({ onCredential }) {
  const { branding } = useTheme();
  const box = useRef(null);
  useEffect(() => {
    if (!branding.googleClientId) return;
    const init = () => {
      if (!window.google?.accounts?.id || !box.current) return;
      window.google.accounts.id.initialize({ client_id: branding.googleClientId, callback: (r) => onCredential(r.credential) });
      window.google.accounts.id.renderButton(box.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with' });
    };
    if (window.google?.accounts?.id) return init();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = init;
    document.head.appendChild(s);
  }, [branding.googleClientId, onCredential]);
  if (!branding.googleClientId) return null;
  return <><div className="divider">or</div><div ref={box} style={{ display: 'grid', placeItems: 'center' }} /></>;
}
