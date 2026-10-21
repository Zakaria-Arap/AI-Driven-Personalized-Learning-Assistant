module.exports = (sequelize, DT) =>
  sequelize.define('Question', {
    topicId: { type: DT.INTEGER, allowNull: false },
    prompt: { type: DT.TEXT, allowNull: false },
    type: { type: DT.ENUM('numeric', 'choice'), allowNull: false, defaultValue: 'numeric' },
    options: DT.JSON,                              // for choice questions: ["a","b",...]
    answer: { type: DT.STRING(120), allowNull: false },  // never sent to the browser before marking
    tolerance: { type: DT.FLOAT, defaultValue: 0 },      // numeric answers
    solution: DT.TEXT,                             // teacher-reviewed worked solution (tutor level 5 only)
    difficulty: { type: DT.INTEGER, defaultValue: 1 },
    reviewed: { type: DT.BOOLEAN, defaultValue: false },
  }, { tableName: 'questions' });
