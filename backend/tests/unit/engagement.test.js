const g = require('../../src/services/engagement/gamification');
const color = require('../../src/utils/color');
const settings = require('../../src/services/settings/settingsService');
const profile = require('../../src/services/profile/profileService');
const images = require('../../src/utils/imageUpload');

const at = (d, h = 10) => { const x = new Date('2026-10-19T12:00:00'); x.setDate(x.getDate() - d); x.setHours(h); return x; };
const now = new Date('2026-10-19T12:00:00');

describe('gamification', () => {
  test('streak counts consecutive days, today optional', () => {
    const attempts = [0, 1, 2].map((d) => ({ createdAt: at(d), correct: true, hintsUsed: 0 }));
    expect(g.compute(attempts, [], now).streak).toBe(3);
    const noToday = [1, 2, 3].map((d) => ({ createdAt: at(d), correct: true, hintsUsed: 0 }));
    expect(g.compute(noToday, [], now).streak).toBe(3);
    const broken = [3, 4].map((d) => ({ createdAt: at(d), correct: true, hintsUsed: 0 }));
    expect(g.compute(broken, [], now).streak).toBe(0);
    expect(g.compute(broken, [], now).bestStreak).toBe(2);
  });
  test('xp, level and badges', () => {
    const attempts = Array.from({ length: 12 }, (_, i) => ({ createdAt: at(i % 4), correct: true, hintsUsed: 0 }));
    const r = g.compute(attempts, [{ score: 85, attempts: 6 }], now);
    expect(r.xp).toBe(12 * 10 + 50);
    expect(r.level).toBe(2);
    const earned = r.badges.filter((b) => b.earned).map((b) => b.key);
    expect(earned).toEqual(expect.arrayContaining(['first_step', 'sharp_10', 'streak_3', 'independent', 'topic_master']));
    expect(earned).not.toContain('streak_7');
  });
  test('activity returns one entry per day', () => {
    const a = g.activity([{ createdAt: at(0), correct: true }, { createdAt: at(0), correct: false }], now, 14);
    expect(a).toHaveLength(14);
    expect(a[13]).toMatchObject({ count: 2, correct: 1 });
  });
});

describe('branding rules', () => {
  test('contrast maths', () => {
    expect(color.contrast('#000000', '#FFFFFF')).toBe(21);
    expect(color.contrast('#17463A', '#FFFFFF')).toBeGreaterThan(8);
  });
  test('rejects colours that are not readable with white text', () => {
    expect(() => settings.validate({ primaryColor: '#F2B23A' })).toThrow(/too light/);
    expect(() => settings.validate({ primaryColor: 'red' })).toThrow(/Colours must/);
    expect(settings.validate({ primaryColor: '#1d4ed8', accentColor: '#f59e0b', radius: 'round' })).toMatchObject({ primaryColor: '#1D4ED8', radius: 'round' });
    expect(() => settings.validate({ fontStyle: 'comic' })).toThrow();
  });
});

describe('profile preferences', () => {
  test('clamps and validates', () => {
    const p = profile.cleanPrefs({}, { fontScale: 500, dailyGoal: 0, theme: 'dark', notify: { badges: false } });
    expect(p).toMatchObject({ fontScale: 130, dailyGoal: 1, theme: 'dark' });
    expect(p.notify).toEqual({ announcements: true, assignments: true, badges: false, announcementEmail: true });
    expect(() => profile.cleanPrefs({}, { theme: 'neon' })).toThrow();
  });
  test('device names', () => {
    expect(profile.describeAgent('Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537')).toBe('Chrome on Windows');
  });
});

describe('image upload safety', () => {
  const png = 'data:image/png;base64,' + Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]).toString('base64');
  test('accepts real png, refuses svg, fake bytes and oversize', () => {
    expect(images.parseDataUrl(png, 1000).ext).toBe('png');
    expect(() => images.parseDataUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', 1000)).toThrow(/PNG, JPG/);
    expect(() => images.parseDataUrl('data:image/png;base64,' + Buffer.from('not an image').toString('base64'), 1000)).toThrow(/real image/);
    expect(() => images.parseDataUrl(png, 4)).toThrow(/too large/);
  });
});
