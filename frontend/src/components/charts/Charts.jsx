// Hand-drawn SVG/CSS charts. No chart library: light, themeable through CSS variables, and accessible.
export function Ring({ value, size = 120, stroke = 12, label, sub }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, value));
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label || 'Progress'} ${Math.round(v)} percent`}>
      <circle className="track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
      <circle className="val" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y={sub ? '46%' : '52%'} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.24} fontWeight="800">{Math.round(v)}%</text>
      {sub && <text x="50%" y="66%" textAnchor="middle" fontSize={size * 0.1} style={{ fill: 'var(--muted)' }}>{sub}</text>}
    </svg>
  );
}

// Stacked bars: total answered with the correct part in the brand colour.
export function ActivityBars({ data, goal }) {
  const max = Math.max(goal || 0, ...data.map((d) => d.count), 4);
  return (
    <div className="bars" role="img" aria-label="Questions answered per day">
      {data.map((d) => {
        const wrong = d.count - d.correct;
        return (
          <div className="col" key={d.date} title={`${d.date}: ${d.count} answered, ${d.correct} correct`}>
            <div className="stackbar" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 0 }}>
              <i style={{ height: `${wrong ? (wrong / d.count) * 100 : 0}%`, background: 'var(--accent)' }} />
              <i style={{ height: `${d.count ? (d.correct / d.count) * 100 : 0}%`, background: 'var(--brand)' }} />
            </div>
            <small>{new Date(d.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'narrow' })}</small>
          </div>
        );
      })}
    </div>
  );
}

export function Heatmap({ days }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const lvl = (n) => (!n ? '' : n / max > 0.75 ? 'l4' : n / max > 0.5 ? 'l3' : n / max > 0.25 ? 'l2' : 'l1');
  const first = new Date(days[0].date + 'T12:00:00').getDay();
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div className="heat" role="img" aria-label="Practice calendar for the last 12 weeks">
        {Array.from({ length: first }, (_, i) => <i key={`p${i}`} style={{ visibility: 'hidden' }} />)}
        {days.map((d) => <i key={d.date} className={lvl(d.count)} title={`${d.date}: ${d.count} answered`} />)}
      </div>
    </div>
  );
}

export function HBars({ rows, max = 100, target }) {
  return (
    <div className="stack gap-s">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="row between small"><span>{r.label}</span><b>{r.value}%</b></div>
          <div className="bar"><i style={{ width: `${Math.min(100, (r.value / max) * 100)}%` }} />{target ? <b style={{ left: `${target}%` }} /> : null}</div>
        </div>
      ))}
    </div>
  );
}

const cellColor = (v) => (v === undefined ? 'var(--surface-2)' : `color-mix(in srgb, var(--brand) ${Math.max(8, Math.round(v * 0.9))}%, var(--surface))`);
export function MatrixHeat({ topics, rows }) {
  return (
    <div className="tablewrap">
      <table className="matrix">
        <thead><tr><th />{topics.map((t) => <th key={t.id} className="col" title={t.title}>{t.title.length > 24 ? t.title.slice(0, 22) + '...' : t.title}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.learnerId}>
              <td className="name">{r.name}</td>
              {topics.map((t) => { const v = r.scores[t.id]; return <td key={t.id} className="cell" title={`${r.name}: ${t.title} ${v ?? 0}%`} style={{ background: cellColor(v), color: v >= 55 ? '#fff' : 'var(--text)' }}>{v ?? ''}</td>; })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
