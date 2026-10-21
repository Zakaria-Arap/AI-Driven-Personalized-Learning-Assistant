const repo = require('../../repositories/notificationRepository');
const userRepo = require('../../repositories/userRepository');
const userView = require('../../helpers/userView');
const { notFound } = require('../../utils/errors');

const PREF_KEY = { announcement: 'announcements', assignment: 'assignments', badge: 'badges' };

exports.list = async (user) => {
  const [items, unread] = await Promise.all([repo.latest(user.id), repo.unreadCount(user.id)]);
  return { unread, items: items.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, read: !!n.readAt, at: n.createdAt })) };
};
exports.markRead = (user, id) => repo.markRead(user.id, id);
exports.markAll = (user) => repo.markAll(user.id);

// Sends one notification to many users, skipping anyone who turned that kind off in their profile.
exports.notifyMany = async (userIds, { type, title, body, link }) => {
  if (!userIds.length) return 0;
  const users = await userRepo.findManyByIds(userIds);
  const rows = users
    .filter((u) => { const key = PREF_KEY[type]; return !key || userView.mergePrefs(u.prefs).notify[key]; })
    .map((u) => ({ userId: u.id, type, title, body: body || null, link: link || null }));
  await repo.bulk(rows);
  return rows.length;
};
exports.notifyOne = (userId, payload) => exports.notifyMany([userId], payload);
void notFound;
