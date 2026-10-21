// A row of subject chips. items: [{ code, name, note? }]. Scrolls sideways on a phone.
export default function SubjectTabs({ items, value, onChange, label = 'Subjects' }) {
  return (
    <div className="subjtabs" role="tablist" aria-label={label}>
      {items.map((s) => (
        <button key={s.code} role="tab" aria-selected={value === s.code} className={value === s.code ? 'on' : ''} onClick={() => onChange(s.code)}>{s.name}{s.note ? <small>{s.note}</small> : null}</button>
      ))}
    </div>
  );
}
