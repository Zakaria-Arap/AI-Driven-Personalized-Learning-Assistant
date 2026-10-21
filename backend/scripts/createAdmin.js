// Usage: node scripts/createAdmin.js <schoolCode> <userCode> "<Full Name>" <email> <tempPassword>
// Creates a school (if needed) and its first administrator. The admin must activate at first sign-in.
const bcrypt = require('bcryptjs');
const { School, User, sequelize } = require('../src/models');

(async () => {
  const [schoolCode, userCode, fullName, email, tempPassword] = process.argv.slice(2);
  if (!tempPassword) {
    console.log('Usage: node scripts/createAdmin.js <schoolCode> <userCode> "<Full Name>" <email> <tempPassword>');
    process.exit(1);
  }
  const [school] = await School.findOrCreate({ where: { code: schoolCode.toUpperCase() }, defaults: { name: `${schoolCode} School` } });
  const user = await User.create({
    schoolId: school.id, userCode: userCode.toUpperCase(), role: 'admin', fullName,
    email: email.toLowerCase(), passwordHash: await bcrypt.hash(tempPassword, 10), mustChangePassword: true,
  });
  console.log(`Admin ${user.userCode} created for ${school.name}. They must activate the account at first sign-in.`);
  await sequelize.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
