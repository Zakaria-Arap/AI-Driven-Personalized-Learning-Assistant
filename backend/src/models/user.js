module.exports = (sequelize, DT) =>
  sequelize.define('User', {
    schoolId: { type: DT.INTEGER, allowNull: false },
    userCode: { type: DT.STRING(30), allowNull: false, unique: true }, // school-issued ID, e.g. AMA-10B-014
    role: { type: DT.ENUM('learner', 'teacher', 'parent', 'principal', 'admin'), allowNull: false },
    fullName: { type: DT.STRING(120), allowNull: false },
    email: { type: DT.STRING(160), unique: true },                      // needed only for Google sign-in and reset codes
    passwordHash: { type: DT.STRING(100), allowNull: false },
    mustChangePassword: { type: DT.BOOLEAN, allowNull: false, defaultValue: true },
    failedAttempts: { type: DT.INTEGER, allowNull: false, defaultValue: 0 },
    lockedUntil: DT.DATE,
    active: { type: DT.BOOLEAN, allowNull: false, defaultValue: true },
    grade: DT.INTEGER,                                                  // learners: 10, 11, 12
    classLabel: DT.STRING(20),                                          // e.g. 10B
    policyAcceptedAt: DT.DATE,
    lastLoginAt: DT.DATE,
    preferredName: DT.STRING(80),
    phone: DT.STRING(30),
    avatarPath: DT.STRING(200),
    bio: DT.STRING(280),
    language: { type: DT.STRING(5), allowNull: false, defaultValue: 'en' },
    prefs: DT.JSON,
    pathway: DT.STRING(12),                                             // learners: 'stem', 'social' or 'arts'
  }, { tableName: 'users' });
