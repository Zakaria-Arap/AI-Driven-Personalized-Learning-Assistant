const { z } = require('zod');
exports.issue = z.object({
  fullName: z.string().trim().min(3).max(120),
  role: z.enum(['learner', 'teacher', 'parent', 'principal', 'admin']),
  email: z.string().trim().email().optional().or(z.literal('').transform(() => undefined)),
  userCode: z.string().trim().min(3).max(30).optional(),
  grade: z.number().int().min(10).max(12).optional(),
  classLabel: z.string().trim().max(20).optional(),
  pathway: z.enum(['stem', 'social']).optional(),
  courseCodes: z.array(z.string().trim().max(10)).max(3).optional(),
});
exports.idParam = z.object({ id: z.coerce.number().int().positive() });
exports.active = z.object({ active: z.boolean() });
exports.link = z.object({ parentId: z.number().int().positive(), learnerId: z.number().int().positive() });
exports.listQuery = z.object({ role: z.enum(['learner', 'teacher', 'parent', 'principal', 'admin']).optional() });
exports.search = z.object({ q: z.string().trim().max(60).optional(), role: z.enum(['learner', 'teacher', 'parent', 'principal', 'admin']).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(15) });
exports.edit = z.object({ fullName: z.string().trim().min(3).max(120).optional(), email: z.string().trim().email().or(z.literal('')).optional(), classLabel: z.string().trim().max(20).optional() });
exports.bulk = z.object({ rows: z.array(z.record(z.any())).min(1).max(300) });
exports.consent = z.object({ canViewTutorChats: z.boolean() });
exports.auditQuery = z.object({ q: z.string().trim().max(60).optional(), action: z.string().trim().max(60).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25) });
exports.courseTeacher = z.object({ teacherId: z.number().int().positive().nullable() });
exports.learnerSubjects = z.object({ pathway: z.enum(['stem', 'social']), courseCodes: z.array(z.string().trim().max(10)).min(1).max(3) });
