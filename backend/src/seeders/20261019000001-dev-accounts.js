'use strict';
// LOCAL DEVELOPMENT ONLY. One easy account per role:
//   username = the role  (learner, teacher, parent, principal, admin)
//   password = <role>@1234   (for example learner@1234)
// Never run this against a real school database.
const bcrypt = require('bcryptjs');

const ROLES = [
  { role: 'learner', fullName: 'Dev Learner', extra: { grade: 10, classLabel: '10B' } },
  { role: 'teacher', fullName: 'Dev Teacher', extra: { classLabel: '10B' } },
  { role: 'parent', fullName: 'Dev Parent', extra: {} },
  { role: 'principal', fullName: 'Dev Principal', extra: {} },
  { role: 'admin', fullName: 'Dev Admin', extra: {} },
];

module.exports = {
  async up() {
    if (process.env.NODE_ENV === 'production') throw new Error('dev-accounts seeder must not run in production');
    const { School, User, ParentLink } = require('../models');
    const [school] = await School.findOrCreate({ where: { code: 'DEMO' }, defaults: { name: 'Demo Senior School', county: 'Kisii' } });

    const made = {};
    for (const { role, fullName, extra } of ROLES) {
      const fields = {
        schoolId: school.id, role, fullName, ...extra,
        passwordHash: await bcrypt.hash(`${role}@1234`, 10),
        mustChangePassword: false, active: true, failedAttempts: 0, lockedUntil: null,
      };
      const userCode = role.toUpperCase();   // stored in capitals; typing "learner" works because sign-in is case-insensitive
      const [user, created] = await User.findOrCreate({ where: { userCode }, defaults: fields });
      if (!created) await user.update(fields);
      made[role] = user;
    }
    await ParentLink.findOrCreate({
      where: { parentId: made.parent.id, learnerId: made.learner.id },
      defaults: { canViewTutorChats: false, verifiedBySchoolAt: new Date() },
    });
  },
  async down() {
    const { User } = require('../models');
    await User.destroy({ where: { userCode: ROLES.map((r) => r.role.toUpperCase()) } });
  },
};
