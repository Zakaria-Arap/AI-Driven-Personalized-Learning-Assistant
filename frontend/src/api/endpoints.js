import { api } from './client.js';
const qs = (o) => { const p = new URLSearchParams(); Object.entries(o || {}).forEach(([k, v]) => v !== undefined && v !== '' && v !== null && p.set(k, v)); const s = p.toString(); return s ? `?${s}` : ''; };

export const authApi = {
  login: (userCode, password) => api.post('/auth/login', { userCode, password }),
  activate: (b) => api.post('/auth/activate', b),
  forgot: (userCode) => api.post('/auth/forgot', { userCode }),
  verifyCode: (userCode, code) => api.post('/auth/verify-code', { userCode, code }),
  reset: (resetToken, newPassword) => api.post('/auth/reset', { resetToken, newPassword }),
  google: (idToken) => api.post('/auth/google', { idToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};
export const settingsApi = {
  public: () => api.get('/settings/public'),
  save: (b) => api.put('/settings', b),
  setLogo: (image) => api.put('/settings/logo', { image }),
  removeLogo: () => api.del('/settings/logo'),
};
export const profileApi = {
  update: (b) => api.patch('/profile', b),
  setAvatar: (image) => api.put('/profile/avatar', { image }),
  removeAvatar: () => api.del('/profile/avatar'),
  password: (currentPassword, newPassword) => api.post('/profile/password', { currentPassword, newPassword }),
  sessions: () => api.get('/profile/sessions'),
  revoke: (id) => api.del(`/profile/sessions/${id}`),
  revokeOthers: () => api.post('/profile/sessions/revoke-others'),
};
export const learnerApi = {
  dashboard: (subject) => api.get(`/learner/dashboard${qs({ subject })}`),
  subjects: () => api.get('/learner/subjects'),
  subjectOptions: () => api.get('/learner/subjects/options'),
  chooseSubjects: (pathway, courseCodes) => api.put('/learner/subjects/choice', { pathway, courseCodes }),
  insights: () => api.get('/learner/insights'),
  practice: (topicId) => api.get(`/learner/practice/${topicId}`),
  answer: (questionId, response, hintsUsed) => api.post('/learner/answers', { questionId, response, hintsUsed }),
};
export const tutorApi = {
  start: (questionId) => api.post('/tutor/sessions', { questionId }),
  send: (sessionId, text) => api.post(`/tutor/sessions/${sessionId}/messages`, { text }),
  transcript: (id) => api.get(`/tutor/sessions/${id}`),
};
export const dashApi = {
  teacher: (o) => api.get(`/dashboards/teacher${qs(o)}`),
  principal: (o) => api.get(`/dashboards/principal${qs(o)}`),
  children: () => api.get('/dashboards/parent/children'),
  childSummary: (id, subject) => api.get(`/dashboards/parent/children/${id}/summary${qs({ subject })}`),
};
export const engageApi = {
  notifications: () => api.get('/notifications'),
  readNotification: (id) => api.post(`/notifications/${id}/read`),
  readAll: () => api.post('/notifications/read-all'),
  announcements: () => api.get('/announcements'),
  postAnnouncement: (b) => api.post('/announcements', b),
  deleteAnnouncement: (id) => api.del(`/announcements/${id}`),
  pinAnnouncement: (id) => api.post(`/announcements/${id}/pin`),
  assignments: () => api.get('/assignments'),
  createAssignment: (b) => api.post('/assignments', b),
  deleteAssignment: (id) => api.del(`/assignments/${id}`),
};
export const adminApi = {
  users: (o) => api.get(`/admin/users${qs(o)}`),
  issue: (b) => api.post('/admin/users', b),
  bulk: (rows) => api.post('/admin/users/bulk', { rows }),
  edit: (id, b) => api.patch(`/admin/users/${id}`, b),
  setActive: (id, active) => api.patch(`/admin/users/${id}/active`, { active }),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  links: () => api.get('/admin/parent-links'),
  link: (parentId, learnerId) => api.post('/admin/parent-links', { parentId, learnerId }),
  consent: (id, canViewTutorChats) => api.patch(`/admin/parent-links/${id}/consent`, { canViewTutorChats }),
  unlink: (id) => api.del(`/admin/parent-links/${id}`),
  audit: (o) => api.get(`/admin/audit${qs(o)}`),
  courses: () => api.get('/admin/courses'),
  setCourseTeacher: (id, teacherId) => api.patch(`/admin/courses/${id}/teacher`, { teacherId }),
  learnerSubjects: (id) => api.get(`/admin/learners/${id}/subjects`),
  setLearnerSubjects: (id, pathway, courseCodes) => api.put(`/admin/learners/${id}/subjects`, { pathway, courseCodes }),
  allUsers: (role) => api.get(`/admin/users/all${qs({ role })}`),
};
