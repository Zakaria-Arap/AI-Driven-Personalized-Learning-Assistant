module.exports = (sequelize, DT) =>
  sequelize.define('SchoolSetting', {
    schoolId: { type: DT.INTEGER, allowNull: false, unique: true },
    name: { type: DT.STRING(120), allowNull: false },
    tagline: DT.STRING(160),
    logoPath: DT.STRING(200),
    primaryColor: { type: DT.STRING(7), allowNull: false, defaultValue: '#17463A' },
    accentColor: { type: DT.STRING(7), allowNull: false, defaultValue: '#F2B23A' },
    defaultMode: { type: DT.ENUM('light', 'dark', 'system'), allowNull: false, defaultValue: 'light' },
    radius: { type: DT.ENUM('sharp', 'soft', 'round'), allowNull: false, defaultValue: 'soft' },
    fontStyle: { type: DT.ENUM('classic', 'modern', 'friendly'), allowNull: false, defaultValue: 'classic' },
    footerText: DT.STRING(200),
    supportEmail: DT.STRING(160),
    updatedBy: DT.INTEGER,
  }, { tableName: 'school_settings' });
