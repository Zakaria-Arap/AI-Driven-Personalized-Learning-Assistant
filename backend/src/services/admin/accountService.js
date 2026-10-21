const bcrypt = require('bcryptjs');
const cfg = require('../../config/auth');
const userRepo = require('../../repositories/userRepository');
const parentRepo = require('../../repositories/parentLinkRepository');
const audit = require('../audit/auditService');
const subjects = require('../subjects/subjectService');
const { tempPassword } = require('../../utils/codes');
const { badRequest, notFound } = require('../../utils/errors');

const PREFIX = { teacher: 'TCH', parent: 'PAR', principal: 'PRN', admin: 'ADM' };

async function nextCode(schoolId, role, classLabel, fullName) {
  const existing = await userRepo.listBySchool(schoolId, role);
  const seq = existing.length + 1;
  if (role === 'learner') {
    const initials = fullName.split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase().padEnd(3, 'X');
    return `${initials}-${classLabel || '10A'}-${String(seq).padStart(3, '0')}`;
  }
  return `${PREFIX[role]}-${String(seq).padStart(4, '0')}`;
}

// The temporary password is returned ONCE, for the admin to hand to the person. It is never stored in plain text.
exports.issueAccount = async (admin, input) => {
  if (input.email && (await userRepo.findByEmail(input.email))) throw badRequest('That email is already registered.', 'EMAIL_TAKEN');
  const userCode = (input.userCode || (await nextCode(admin.schoolId, input.role, input.classLabel, input.fullName))).toUpperCase();
  if (await userRepo.findByCode(userCode)) throw badRequest('That school ID already exists.', 'CODE_TAKEN');
  const temp = tempPassword();
  const user = await userRepo.create({
    schoolId: admin.schoolId,
    userCode,
    role: input.role,
    fullName: input.fullName,
    email: input.email ? input.email.toLowerCase() : null,
    passwordHash: await bcrypt.hash(temp, cfg.bcryptRounds),
    mustChangePassword: true,
    grade: input.role === 'learner' ? input.grade || 10 : null,
    classLabel: input.classLabel || null,
  });
  await audit.record('ACCOUNT_ISSUED', { actorId: admin.id, targetType: 'user', targetId: user.id, meta: { role: user.role } });
  if (user.role === 'learner' && input.pathway && input.courseCodes && input.courseCodes.length) await subjects.choose(admin, user, { pathway: input.pathway, courseCodes: input.courseCodes });
  return { user, tempPassword: temp };
};

exports.setActive = async (admin, userId, active) => {
  const user = await userRepo.findById(userId);
  if (!user || user.schoolId !== admin.schoolId) throw notFound('Account not found');
  await userRepo.update(user, { active });
  await audit.record(active ? 'ACCOUNT_ENABLED' : 'ACCOUNT_DISABLED', { actorId: admin.id, targetType: 'user', targetId: user.id });
  return user;
};

exports.resetToTemporary = async (admin, userId) => {
  const user = await userRepo.findById(userId);
  if (!user || user.schoolId !== admin.schoolId) throw notFound('Account not found');
  const temp = tempPassword();
  await userRepo.update(user, { passwordHash: await bcrypt.hash(temp, cfg.bcryptRounds), mustChangePassword: true, failedAttempts: 0, lockedUntil: null });
  await audit.record('TEMP_PASSWORD_ISSUED', { actorId: admin.id, targetType: 'user', targetId: user.id });
  return { user, tempPassword: temp };
};

exports.linkParent = async (admin, { parentId, learnerId }) => {
  const [parent, learner] = await Promise.all([userRepo.findById(parentId), userRepo.findById(learnerId)]);
  if (!parent || parent.role !== 'parent' || !learner || learner.role !== 'learner') throw badRequest('Pick one parent and one learner.');
  if (parent.schoolId !== admin.schoolId || learner.schoolId !== admin.schoolId) throw notFound('Account not found');
  const link = await parentRepo.create({ parentId, learnerId, canViewTutorChats: false, verifiedBySchoolAt: new Date() });
  await audit.record('PARENT_LINKED', { actorId: admin.id, targetType: 'parent_link', targetId: link.id });
  return link;
};

exports.list = (admin, role) => userRepo.listBySchool(admin.schoolId, role);

exports.search = (admin, q) => userRepo.search({ schoolId: admin.schoolId, q: q.q, role: q.role, page: q.page, pageSize: q.pageSize });

exports.updateUser = async (admin, userId, patch) => {
  const user = await userRepo.findById(userId);
  if (!user || user.schoolId !== admin.schoolId) throw notFound('Account not found');
  const upd = {};
  if (patch.fullName !== undefined) upd.fullName = patch.fullName.trim();
  if (patch.classLabel !== undefined) upd.classLabel = patch.classLabel.trim() || null;
  if (patch.email !== undefined) {
    const e = patch.email.trim().toLowerCase() || null;
    const other = e ? await userRepo.findByEmail(e) : null;
    if (other && other.id !== user.id) throw badRequest('That email is already registered.', 'EMAIL_TAKEN');
    upd.email = e;
  }
  await userRepo.update(user, upd);
  await audit.record('ACCOUNT_EDITED', { actorId: admin.id, targetType: 'user', targetId: user.id, meta: { fields: Object.keys(upd) } });
  return user;
};

// Bulk issue (CSV import in the app). Each row succeeds or fails on its own.
exports.bulkIssue = async (admin, rows) => {
  const results = [];
  const rowSchema = require('../../validators/admin.validators').issue;
  for (const raw of rows) {
    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) { results.push({ ok: false, fullName: raw.fullName, role: raw.role, error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }); continue; }
    const row = parsed.data;
    try {
      const { user, tempPassword } = await exports.issueAccount(admin, row);
      results.push({ ok: true, fullName: user.fullName, role: user.role, userCode: user.userCode, tempPassword });
    } catch (e) { results.push({ ok: false, fullName: row.fullName, role: row.role, error: e.message }); }
  }
  await audit.record('ACCOUNTS_BULK_ISSUED', { actorId: admin.id, meta: { count: results.filter((r) => r.ok).length } });
  return results;
};

exports.listLinks = async (admin) => (await parentRepo.listForSchool(admin.schoolId)).map((l) => ({
  id: l.id, parent: { id: l.parent.id, name: l.parent.fullName, userCode: l.parent.userCode },
  learner: { id: l.learner.id, name: l.learner.fullName, userCode: l.learner.userCode, classLabel: l.learner.classLabel },
  canViewTutorChats: l.canViewTutorChats, verifiedBySchoolAt: l.verifiedBySchoolAt,
}));
exports.setConsent = async (admin, linkId, canViewTutorChats) => {
  const link = await parentRepo.findById(linkId);
  if (!link) throw notFound('Link not found');
  const learner = await userRepo.findById(link.learnerId);
  if (!learner || learner.schoolId !== admin.schoolId) throw notFound('Link not found');
  await parentRepo.update(link, { canViewTutorChats });
  await audit.record(canViewTutorChats ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED', { actorId: admin.id, targetType: 'parent_link', targetId: link.id });
  return link;
};
exports.removeLink = async (admin, linkId) => {
  const link = await parentRepo.findById(linkId);
  if (!link) throw notFound('Link not found');
  const learner = await userRepo.findById(link.learnerId);
  if (!learner || learner.schoolId !== admin.schoolId) throw notFound('Link not found');
  await parentRepo.destroy(link);
  await audit.record('PARENT_UNLINKED', { actorId: admin.id, targetType: 'parent_link', targetId: linkId });
  return { done: true };
};
