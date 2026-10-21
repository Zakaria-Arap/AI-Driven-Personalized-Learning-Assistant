// Saves a small image sent as a data URL. SVG is refused on purpose (it can carry scripts).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const { badRequest } = require('./errors');

const TYPES = {
  'image/png': { ext: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  'image/jpeg': { ext: 'jpg', magic: [0xff, 0xd8, 0xff] },
  'image/webp': { ext: 'webp', magic: [0x52, 0x49, 0x46, 0x46] },
};

exports.parseDataUrl = (dataUrl, maxBytes) => {
  const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw badRequest('Use a PNG, JPG or WebP image.', 'BAD_IMAGE');
  const type = TYPES[m[1]];
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > maxBytes) throw badRequest(`Image is too large (max ${Math.round(maxBytes / 1024)} KB).`, 'IMAGE_TOO_LARGE');
  if (!type.magic.every((b, i) => buf[i] === b)) throw badRequest('That file is not a real image.', 'BAD_IMAGE');
  return { buf, ext: type.ext };
};

exports.save = (prefix, dataUrl, maxBytes = 512 * 1024) => {
  const { buf, ext } = exports.parseDataUrl(dataUrl, maxBytes);
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  const name = `${prefix}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(config.uploadsDir, name), buf);
  return `/uploads/${name}`;
};

exports.remove = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const file = path.join(config.uploadsDir, path.basename(publicPath));
  try { fs.unlinkSync(file); } catch { /* already gone */ }
};
