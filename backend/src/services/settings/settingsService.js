const repo = require('../../repositories/settingsRepository');
const audit = require('../audit/auditService');
const color = require('../../utils/color');
const images = require('../../utils/imageUpload');
const { badRequest } = require('../../utils/errors');

const DEFAULTS = {
  name: 'Somo', tagline: 'Learn maths at your own pace', logoUrl: null,
  primaryColor: '#17463A', accentColor: '#F2B23A', defaultMode: 'light', radius: 'soft', fontStyle: 'classic',
  footerText: '', supportEmail: '',
};
const MIN_CONTRAST = 4.5; // white text on the primary colour must be readable (WCAG AA)

const view = (row) => (row ? {
  name: row.name, tagline: row.tagline || '', logoUrl: row.logoPath || null,
  primaryColor: row.primaryColor, accentColor: row.accentColor, defaultMode: row.defaultMode,
  radius: row.radius, fontStyle: row.fontStyle, footerText: row.footerText || '', supportEmail: row.supportEmail || '',
} : { ...DEFAULTS });

// Public: used by the sign-in page before anyone is signed in.
exports.getPublic = async (schoolCode) => {
  const school = (schoolCode && (await repo.schoolByCode(String(schoolCode).toUpperCase()))) || (await repo.firstSchool());
  const settings = school ? view(await repo.forSchool(school.id)) : { ...DEFAULTS };
  if (school && settings.name === 'Somo') settings.name = school.name;
  return { ...settings, googleClientId: process.env.GOOGLE_CLIENT_ID || '' };
};

exports.get = async (schoolId) => view(await repo.forSchool(schoolId));

const SELECT = { defaultMode: ['light', 'dark', 'system'], radius: ['sharp', 'soft', 'round'], fontStyle: ['classic', 'modern', 'friendly'] };

exports.validate = (patch) => {
  const out = {};
  if (patch.name !== undefined) { const n = String(patch.name).trim(); if (n.length < 2 || n.length > 80) throw badRequest('School name must be 2 to 80 characters.', 'BAD_NAME'); out.name = n; }
  for (const k of ['tagline', 'footerText']) if (patch[k] !== undefined) out[k] = String(patch[k]).trim().slice(0, k === 'tagline' ? 160 : 200);
  if (patch.supportEmail !== undefined) {
    const e = String(patch.supportEmail).trim();
    if (e && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw badRequest('Support email is not valid.', 'BAD_EMAIL');
    out.supportEmail = e;
  }
  for (const k of ['primaryColor', 'accentColor']) {
    if (patch[k] === undefined) continue;
    if (!color.isHex(patch[k])) throw badRequest('Colours must look like #17463A.', 'BAD_COLOR');
    out[k] = patch[k].toUpperCase();
  }
  if (out.primaryColor && color.contrast(out.primaryColor, '#FFFFFF') < MIN_CONTRAST) {
    throw badRequest(`That main colour is too light for white text (contrast ${color.contrast(out.primaryColor, '#FFFFFF')}, needs ${MIN_CONTRAST}). Pick a darker shade.`, 'LOW_CONTRAST');
  }
  for (const [k, allowed] of Object.entries(SELECT)) if (patch[k] !== undefined) { if (!allowed.includes(patch[k])) throw badRequest(`Invalid ${k}.`, 'BAD_OPTION'); out[k] = patch[k]; }
  return out;
};

exports.update = async (actor, patch) => {
  const clean = exports.validate(patch);
  await repo.upsert(actor.schoolId, { name: DEFAULTS.name, ...clean, updatedBy: actor.id });
  await audit.record('BRANDING_UPDATED', { actorId: actor.id, targetType: 'school', targetId: actor.schoolId, meta: { fields: Object.keys(clean) } });
  return exports.get(actor.schoolId);
};

exports.setLogo = async (actor, dataUrl) => {
  const existing = await repo.forSchool(actor.schoolId);
  const path = images.save(`logo-${actor.schoolId}`, dataUrl, 512 * 1024);
  await repo.upsert(actor.schoolId, { name: existing?.name || DEFAULTS.name, logoPath: path, updatedBy: actor.id });
  if (existing?.logoPath) images.remove(existing.logoPath);
  await audit.record('LOGO_CHANGED', { actorId: actor.id, targetType: 'school', targetId: actor.schoolId });
  return exports.get(actor.schoolId);
};

exports.removeLogo = async (actor) => {
  const existing = await repo.forSchool(actor.schoolId);
  if (existing?.logoPath) { images.remove(existing.logoPath); await repo.upsert(actor.schoolId, { name: existing.name, logoPath: null, updatedBy: actor.id }); }
  await audit.record('LOGO_REMOVED', { actorId: actor.id, targetType: 'school', targetId: actor.schoolId });
  return exports.get(actor.schoolId);
};

exports.MIN_CONTRAST = MIN_CONTRAST;
