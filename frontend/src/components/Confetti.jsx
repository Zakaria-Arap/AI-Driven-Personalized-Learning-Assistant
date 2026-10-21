import { useEffect, useState } from 'react';
export default function Confetti({ run }) {
  const [on, setOn] = useState(false);
  useEffect(() => { if (run) { setOn(true); const t = setTimeout(() => setOn(false), 2800); return () => clearTimeout(t); } }, [run]);
  if (!on) return null;
  const colors = ['var(--accent)', 'var(--brand-2)', '#E8590C', '#2D8A5B', '#6D28D9'];
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 46 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % 5], animationDelay: `${(i % 9) * 0.08}s`, animationDuration: `${1.8 + (i % 5) * 0.3}s` }} />)}</div>;
}
