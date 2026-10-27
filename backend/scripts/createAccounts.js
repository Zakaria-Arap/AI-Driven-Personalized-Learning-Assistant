const bcrypt = require('bcryptjs');
const { User, School } = require('../src/models');

(async () => {
  try {
    let school = await School.findOne();
    if (!school) {
      school = await School.create({
        name: 'Test School',
        code: 'TST',
        subdomain: 'test',
        timezone: 'UTC'
      });
    }

    const accounts = [
      { userCode: 'admin', role: 'admin', fullName: 'Administrator', password: 'admin@1234' },
      { userCode: 'principal', role: 'principal', fullName: 'Principal', password: 'principal@1234' },
      { userCode: 'teacher', role: 'teacher', fullName: 'Teacher', password: 'teacher@1234' },
      { userCode: 'parent', role: 'parent', fullName: 'Parent', password: 'parent@1234' },
      { userCode: 'learner', role: 'learner', fullName: 'Learner', password: 'learner@1234', grade: 10 }
    ];

    for (const acc of accounts) {
      let user = await User.findOne({ where: { userCode: acc.userCode } });
      const hash = await bcrypt.hash(acc.password, 10);
      
      if (user) {
        user.passwordHash = hash;
        user.mustChangePassword = false;
        await user.save();
        console.log(`✓ Updated: ${acc.userCode} / ${acc.password}`);
      } else {
        await User.create({
          schoolId: school.id,
          userCode: acc.userCode,
          role: acc.role,
          fullName: acc.fullName,
          passwordHash: hash,
          mustChangePassword: false,
          language: 'en',
          grade: acc.grade || null
        });
        console.log(`✓ Created: ${acc.userCode} / ${acc.password}`);
      }
    }

    console.log('\nAll accounts ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
