// Colour helpers used to keep school branding readable (WCAG contrast).
const HEX = /^#[0-9a-fA-F]{6}$/;
exports.isHex = (s) => typeof s === 'string' && HEX.test(s);
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
exports.luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
exports.contrast = (a, b) => {
  const [hi, lo] = [exports.luminance(a), exports.luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};
