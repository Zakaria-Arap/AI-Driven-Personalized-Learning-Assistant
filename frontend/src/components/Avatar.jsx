export default function Avatar({ user, size = '' }) {
  const name = user?.displayName || user?.fullName || '?';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span className={`avatar ${size}`} aria-hidden="true">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials}</span>;
}
