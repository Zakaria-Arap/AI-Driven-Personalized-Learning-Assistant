const RULES = [['At least 8 characters', (p) => p.length >= 8], ['One uppercase letter', (p) => /[A-Z]/.test(p)], ['One number', (p) => /[0-9]/.test(p)], ['One symbol (for example - # !)', (p) => /[^A-Za-z0-9]/.test(p)]];
export const passwordOk = (p) => RULES.every(([, t]) => t(p));
export function PasswordRules({ password }) {
  const n = RULES.filter(([, t]) => t(password)).length;
  const colors = ['var(--danger)', 'var(--danger)', 'var(--accent)', '#7BB661', 'var(--ok)'];
  return (
    <div className="stack gap-s">
      <div className="strength" aria-hidden="true"><i style={{ width: `${(n / 4) * 100}%`, background: colors[n] }} /></div>
      <ul className="rules">{RULES.map(([l, t]) => <li key={l} className={t(password) ? 'ok' : ''}>{t(password) ? '✓' : '○'} {l}</li>)}</ul>
    </div>
  );
}
