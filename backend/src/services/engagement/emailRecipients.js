// Pure function: select email recipients for announcements
// Same audience logic as announcementService.create, excludes author,
// filters active users with valid emails, dedupes by email

exports.selectEmailRecipients = ({ audience, authorId, users }) => {
  const roleMap = {
    all: ['admin', 'tutor', 'learner', 'parent'],
    tutors: ['tutor'],
    learners: ['learner'],
    parents: ['parent'],
  };

  const targetRoles = roleMap[audience] || [];
  
  return users
    .filter(u => u.id !== authorId)
    .filter(u => targetRoles.includes(u.role))
    .filter(u => u.status === 'active')
    .filter(u => u.email && u.email.includes('@'))
    .filter(u => {
      const pref = u.prefs?.notify?.announcementEmail;
      return pref !== false; // default true if undefined
    })
    .reduce((acc, u) => {
      if (!acc.some(x => x.email === u.email)) {
        acc.push(u);
      }
      return acc;
    }, []);
};
