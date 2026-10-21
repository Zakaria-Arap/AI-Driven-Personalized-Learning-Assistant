describe('User preferences - announcementEmail', () => {
  test('default announcementEmail is true when not set', () => {
    const prefs = {};
    const announcementEmail = prefs.notify?.announcementEmail ?? true;
    expect(announcementEmail).toBe(true);
  });

  test('default announcementEmail is true when notify is empty', () => {
    const prefs = { notify: {} };
    const announcementEmail = prefs.notify?.announcementEmail ?? true;
    expect(announcementEmail).toBe(true);
  });

  test('explicit false is respected', () => {
    const prefs = { notify: { announcementEmail: false } };
    const announcementEmail = prefs.notify?.announcementEmail ?? true;
    expect(announcementEmail).toBe(false);
  });

  test('explicit true is respected', () => {
    const prefs = { notify: { announcementEmail: true } };
    const announcementEmail = prefs.notify?.announcementEmail ?? true;
    expect(announcementEmail).toBe(true);
  });
});
