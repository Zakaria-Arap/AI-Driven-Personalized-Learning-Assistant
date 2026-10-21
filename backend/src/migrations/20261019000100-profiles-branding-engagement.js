'use strict';
// Adds profile columns to users and the tables for branding, sessions, notifications, announcements, assignments and badges.
// Idempotent: columns that already exist (fresh installs create them with migration 1) are skipped.
module.exports = {
  async up() {
    const db = require('../models');
    const { DataTypes } = db.Sequelize;
    const qi = db.sequelize.getQueryInterface();
    const cols = await qi.describeTable('users');
    const add = async (name, def) => { if (!cols[name]) await qi.addColumn('users', name, def); };
    await add('preferred_name', { type: DataTypes.STRING(80) });
    await add('phone', { type: DataTypes.STRING(30) });
    await add('avatar_path', { type: DataTypes.STRING(200) });
    await add('bio', { type: DataTypes.STRING(280) });
    await add('language', { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' });
    await add('prefs', { type: DataTypes.JSON });
    for (const name of ['SchoolSetting', 'UserSession', 'Notification', 'Announcement', 'Assignment', 'UserBadge']) await db[name].sync();
  },
  async down() {
    const db = require('../models');
    const qi = db.sequelize.getQueryInterface();
    for (const name of ['UserBadge', 'Assignment', 'Announcement', 'Notification', 'UserSession', 'SchoolSetting']) await qi.dropTable(db[name].getTableName());
    for (const c of ['prefs', 'language', 'bio', 'avatar_path', 'phone', 'preferred_name']) await qi.removeColumn('users', c);
  },
};
