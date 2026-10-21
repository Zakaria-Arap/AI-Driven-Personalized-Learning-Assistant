export default function ErrorNote({ error }) {
  if (!error) return null;
  return <div className="error" role="alert">{error.message || String(error)}</div>;
}
