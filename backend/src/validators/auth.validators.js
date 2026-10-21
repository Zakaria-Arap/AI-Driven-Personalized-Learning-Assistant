const { z } = require('zod');
const code = z.string().trim().min(3).max(30);
exports.login = z.object({ userCode: code, password: z.string().min(1).max(200) });
exports.activate = z.object({ userCode: code, tempPassword: z.string().min(1).max(200), newPassword: z.string().min(1).max(200), acceptPolicy: z.boolean() });
exports.forgot = z.object({ userCode: code });
exports.verifyCode = z.object({ userCode: code, code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') });
exports.reset = z.object({ resetToken: z.string().min(10), newPassword: z.string().min(1).max(200) });
exports.google = z.object({ idToken: z.string().min(10) });
