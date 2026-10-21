const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: false,
  define: { underscored: true },
});

const defs = {
  School: require('./school'),
  User: require('./user'),
  ParentLink: require('./parentLink'),
  Subject: require('./subject'),
  Strand: require('./strand'),
  Topic: require('./topic'),
  Question: require('./question'),
  Attempt: require('./attempt'),
  Mastery: require('./mastery'),
  TutorSession: require('./tutorSession'),
  TutorMessage: require('./tutorMessage'),
  ResetCode: require('./resetCode'),
  AuditLog: require('./auditLog'),
  SchoolSetting: require('./schoolSetting'),
  UserSession: require('./userSession'),
  Notification: require('./notification'),
  Announcement: require('./announcement'),
  Assignment: require('./assignment'),
  UserBadge: require('./userBadge'),
  Course: require('./course'),
  Enrolment: require('./enrolment'),
};

const db = { sequelize, Sequelize };
for (const [name, define] of Object.entries(defs)) db[name] = define(sequelize, DataTypes);

const { Course, Enrolment, SchoolSetting, UserSession, Notification, Announcement, Assignment, UserBadge, School, User, ParentLink, Subject, Strand, Topic, Question, Attempt, Mastery, TutorSession, TutorMessage, ResetCode, AuditLog } = db;

School.hasMany(User, { foreignKey: 'schoolId' });
User.belongsTo(School, { foreignKey: 'schoolId' });

ParentLink.belongsTo(User, { as: 'parent', foreignKey: 'parentId' });
ParentLink.belongsTo(User, { as: 'learner', foreignKey: 'learnerId' });

Subject.hasMany(Strand, { foreignKey: 'subjectId' });
Strand.belongsTo(Subject, { foreignKey: 'subjectId' });
Strand.hasMany(Topic, { foreignKey: 'strandId' });
Topic.belongsTo(Strand, { foreignKey: 'strandId' });
Topic.hasMany(Question, { foreignKey: 'topicId' });
Question.belongsTo(Topic, { foreignKey: 'topicId' });
Topic.belongsToMany(Topic, { as: 'Prerequisites', through: 'topic_prerequisites', foreignKey: 'topic_id', otherKey: 'prerequisite_id', timestamps: false });

Attempt.belongsTo(User, { as: 'learner', foreignKey: 'learnerId' });
Attempt.belongsTo(Question, { foreignKey: 'questionId' });
Attempt.belongsTo(Topic, { foreignKey: 'topicId' });

Mastery.belongsTo(User, { as: 'learner', foreignKey: 'learnerId' });
Mastery.belongsTo(Topic, { foreignKey: 'topicId' });

TutorSession.belongsTo(User, { as: 'learner', foreignKey: 'learnerId' });
TutorSession.belongsTo(Topic, { foreignKey: 'topicId' });
TutorSession.hasMany(TutorMessage, { foreignKey: 'sessionId' });
TutorMessage.belongsTo(TutorSession, { foreignKey: 'sessionId' });

ResetCode.belongsTo(User, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { as: 'actor', foreignKey: 'actorId' });
SchoolSetting.belongsTo(School, { foreignKey: 'schoolId' });
UserSession.belongsTo(User, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Announcement.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Assignment.belongsTo(Topic, { foreignKey: 'topicId' });
Assignment.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
UserBadge.belongsTo(User, { foreignKey: 'userId' });
Course.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
Course.belongsTo(School, { foreignKey: 'schoolId' });
Enrolment.belongsTo(Course, { foreignKey: 'courseId' });
Enrolment.belongsTo(User, { as: 'learner', foreignKey: 'learnerId' });
Course.hasMany(Enrolment, { foreignKey: 'courseId' });

// Creation order for migrations (parents before children).
db.modelOrder = ['School', 'User', 'ParentLink', 'Subject', 'Strand', 'Topic', 'Question', 'Attempt', 'Mastery', 'TutorSession', 'TutorMessage', 'ResetCode', 'AuditLog', 'SchoolSetting', 'UserSession', 'Notification', 'Announcement', 'Assignment', 'UserBadge', 'Course', 'Enrolment'];

module.exports = db;
