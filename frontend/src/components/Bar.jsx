export default function Bar({ value, target }) {
  return <div className="bar" role="img" aria-label={`${value} percent`}><i style={{ width: `${Math.min(100, value)}%` }} />{target ? <b style={{ left: `${target}%` }} title={`Target ${target}%`} /> : null}</div>;
}
