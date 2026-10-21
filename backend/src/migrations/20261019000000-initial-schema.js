'use strict';
// Creates every table from the model definitions, in dependency order.
// For later changes, add NEW migration files (never edit this one after it has been run).
// Frozen list: models added later get their own migrations.
const ORIGINAL = ['School', 'User', 'ParentLink', 'Subject', 'Strand', 'Topic', 'Question', 'Attempt', 'Mastery', 'TutorSession', 'TutorMessage', 'ResetCode', 'AuditLog'];

module.exports = {
  async up() {
    const db = require('../models');
    for (const name of ORIGINAL) await db[name].sync();
    await db.sequelize.getQueryInterface().createTable('topic_prerequisites', {
      topic_id: { type: db.Sequelize.INTEGER, allowNull: false },
      prerequisite_id: { type: db.Sequelize.INTEGER, allowNull: false },
    });
  },
  async down() {
    const db = require('../models');
    const qi = db.sequelize.getQueryInterface();
    await qi.dropTable('topic_prerequisites');
    for (const name of [...ORIGINAL].reverse()) await qi.dropTable(db[name].getTableName());
  },
};
