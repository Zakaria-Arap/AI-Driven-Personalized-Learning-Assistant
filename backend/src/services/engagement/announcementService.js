const repo = require('../../repositories/announcementRepository');
const userRepo = require('../../repositories/userRepository');
const notifications = require('./notificationService');
const audit = require('../audit/auditService');
const { badRequest, forbidden, notFound } = require('../../utils/errors');

const ROLE_AUDIENCES = { teacher: ['learner', 'parent'], principal: ['all', 'learner', 'teacher', 'parent'], admin: ['all', 'learner', 'teacher', 'parent'] };

exports.create = async (author, { title, body, audience, pinned }) => {
  if (!(ROLE_AUDIENCES[author.role] || []).includes(audience)) throw forbidden('You cannot post to that audience.');
  if (pinned && author.role === 'teacher') throw forbidden('Only the principal or admin can pin.');
  const a = await repo.create({ schoolId: author.schoolId, authorId: author.id, audience, title, body, pinned: !!pinned });
  const roles = audience === 'all' ? ['learner', 'teacher', 'parent', 'principal', 'admin'] : [audience];
  let ids = [];
  for (const r of roles) ids = ids.concat(await userRepo.idsByRole(author.schoolId, r));
  await notifications.notifyMany(ids.filter((i) => i !== author.id), { type: 'announcement', title, body: body.slice(0, 120), link: '/announcements' });
  await audit.record('ANNOUNCEMENT_POSTED', { actorId: author.id, targetType: 'announcement', targetId: a.id, meta: { audience } });
  return a;
};

exports.list = async (user) => {
  const rows = await repo.forAudience(user.schoolId, user.role, user.id); // staff who can post also see everything they or others posted
  return rows.map((a) => ({ id: a.id, title: a.title, body: a.body, audience: a.audience, pinned: a.pinned, at: a.createdAt, author: a.author?.fullName, authorRole: a.author?.role, mine: a.authorId === user.id }));
};

exports.remove = async (user, id) => {
  const a = await repo.find(id);
  if (!a || a.schoolId !== user.schoolId) throw notFound('Announcement not found');
  if (a.authorId !== user.id && !['admin', 'principal'].includes(user.role)) throw forbidden();
  await repo.destroy(a);
  return { done: true };
};

exports.togglePin = async (user, id) => {
  const a = await repo.find(id);
  if (!a || a.schoolId !== user.schoolId) throw notFound('Announcement not found');
  if (!['admin', 'principal'].includes(user.role)) throw forbidden();
  await repo.update(a, { pinned: !a.pinned });
  return { pinned: a.pinned };
};
void badRequest;
