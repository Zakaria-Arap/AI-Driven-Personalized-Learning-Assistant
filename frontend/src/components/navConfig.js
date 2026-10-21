// One list drives the sidebar, the page title and the command palette.
export const NAV = {
  learner: [
    { group: 'nav.learning', items: [
      { to: '/learner', label: 'nav.dashboard', icon: 'dashboard', end: true },
      { to: '/learner/subjects', label: 'nav.subjects', icon: 'book' },
      { to: '/learner/reviews', label: 'nav.reviews', icon: 'calendar' },
      { to: '/learner/achievements', label: 'nav.achievements', icon: 'trophy' },
    ] },
    { group: 'nav.school', items: [{ to: '/announcements', label: 'nav.announcements', icon: 'megaphone' }] },
  ],
  teacher: [
    { group: 'nav.learning', items: [
      { to: '/teacher', label: 'nav.overview', icon: 'dashboard', end: true },
      { to: '/teacher/assignments', label: 'nav.assignments', icon: 'clipboard' },
      { to: '/teacher/flagged', label: 'nav.flagged', icon: 'flag' },
    ] },
    { group: 'nav.school', items: [{ to: '/announcements', label: 'nav.announcements', icon: 'megaphone' }] },
  ],
  parent: [
    { group: 'nav.learning', items: [{ to: '/parent', label: 'nav.children', icon: 'users', end: true }] },
    { group: 'nav.school', items: [{ to: '/announcements', label: 'nav.announcements', icon: 'megaphone' }] },
  ],
  principal: [
    { group: 'nav.school', items: [
      { to: '/principal', label: 'nav.overview', icon: 'dashboard', end: true },
      { to: '/announcements', label: 'nav.announcements', icon: 'megaphone' },
      { to: '/principal/branding', label: 'nav.branding', icon: 'palette' },
    ] },
  ],
  admin: [
    { group: 'nav.manage', items: [
      { to: '/admin', label: 'nav.accounts', icon: 'users', end: true },
      { to: '/admin/subjects', label: 'nav.subjects', icon: 'book' },
      { to: '/admin/links', label: 'nav.links', icon: 'link' },
      { to: '/admin/branding', label: 'nav.branding', icon: 'palette' },
      { to: '/announcements', label: 'nav.announcements', icon: 'megaphone' },
      { to: '/admin/audit', label: 'nav.audit', icon: 'shield' },
    ] },
  ],
};
export const COMMON = [
  { to: '/notifications', label: 'nav.notifications', icon: 'bell' },
  { to: '/profile', label: 'nav.profile', icon: 'user' },
];
export const flat = (role) => [...(NAV[role] || []).flatMap((g) => g.items), ...COMMON];
