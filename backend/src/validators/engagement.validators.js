const { z } = require('zod');
exports.settings = z.object({
  name: z.string().max(80).optional(), tagline: z.string().max(160).optional(), footerText: z.string().max(200).optional(), supportEmail: z.string().max(160).optional(),
  primaryColor: z.string().optional(), accentColor: z.string().optional(),
  defaultMode: z.string().optional(), radius: z.string().optional(), fontStyle: z.string().optional(),
}).strict();
exports.image = z.object({ image: z.string().min(30).max(800000) });
exports.profile = z.object({
  preferredName: z.string().max(80).optional(), phone: z.string().max(30).optional(), bio: z.string().max(280).optional(), email: z.string().max(160).optional(), language: z.string().max(5).optional(),
  prefs: z.object({ theme: z.string().optional(), fontScale: z.number().optional(), reducedMotion: z.boolean().optional(), density: z.string().optional(), dailyGoal: z.number().optional(), notify: z.object({ announcements: z.boolean().optional(), assignments: z.boolean().optional(), badges: z.boolean().optional() }).optional() }).optional(),
}).strict();
exports.password = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(1).max(200) });
exports.idParam = z.object({ id: z.coerce.number().int().positive() });
exports.announcement = z.object({ title: z.string().trim().min(3).max(160), body: z.string().trim().min(3).max(2000), audience: z.enum(['all', 'learner', 'teacher', 'parent']), pinned: z.boolean().optional() });
exports.assignment = z.object({ classLabel: z.string().trim().min(1).max(20), topicId: z.number().int().positive(), dueAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(), note: z.string().trim().max(300).optional() });
