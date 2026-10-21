# API summary (all under /api, JSON)

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | /auth/login | anyone | School ID + password. Returns `mustActivate` for first login |
| POST | /auth/activate | anyone with temp password | New password + data policy |
| POST | /auth/forgot, /auth/verify-code, /auth/reset | anyone | 6-digit code reset |
| POST | /auth/google | registered email | Google ID token |
| POST | /auth/logout, GET /auth/me | signed in | |
| GET | /learner/dashboard?subject=PHY | learner | One subject's mastery map and next step, plus progress in all the learner's subjects |
| GET | /learner/subjects | learner | The learner's subjects (compulsory + chosen electives) with teacher and progress |
| GET, PUT | /learner/subjects/options, /learner/subjects/choice | learner | Pathway and electives: read options, save `{pathway, courseCodes}` (1 to 3 from that pathway) |
| GET | /learner/practice/:topicId | learner | Questions without answers (403 if the topic is not in the learner's subjects and grade) |
| POST | /learner/answers | learner | Mark answer, update mastery |
| POST | /tutor/sessions, /tutor/sessions/:id/messages | learner | Tutor chat with hint ladder |
| GET | /tutor/sessions/:id | learner (own), teacher (flagged only) | Transcript |
| GET | /dashboards/teacher?subject=&grade=&classLabel= | teacher | Learners enrolled in the teacher's own subject, one grade, optional class; flagged chats of their subject |
| GET | /dashboards/parent/children[/:id/summary?subject=] | parent | Linked children; weekly summary with every subject and its teacher |
| GET | /dashboards/parent/children/:id/chats | parent + consent | Chat list |
| GET | /dashboards/principal?subject=&grade= | principal | Class totals, average per subject, topic coverage of one subject and grade |
| GET/POST | /admin/users | admin | List / issue accounts (temp password shown once) |
| PATCH | /admin/users/:id/active | admin | Enable / disable |
| POST | /admin/users/:id/reset-password | admin | New temporary password |
| POST | /admin/parent-links | admin | Link parent and learner |
| GET | /admin/audit | admin | Recent audit entries |
| GET | /admin/courses | admin | All subjects with teacher and learner counts per grade |
| PATCH | /admin/courses/:id/teacher | admin | `{teacherId}` (or `null`) sets the subject's one teacher; the teacher is notified |
| GET, PUT | /admin/learners/:id/subjects | admin | Read / set a learner's pathway and electives |
| GET | /settings/public | anyone | School branding for the sign-in page |
| GET/PUT | /settings | any / admin, principal | Read / change branding (colour contrast is checked) |
| PUT/DELETE | /settings/logo | admin, principal | Upload (PNG/JPG/WebP data URL) / remove logo |
| PATCH | /profile | signed in | Display name, phone, bio, email, language, preferences |
| PUT/DELETE | /profile/avatar | signed in | Upload / remove photo |
| POST | /profile/password | signed in | Change password (other devices are signed out) |
| GET, POST, DELETE | /profile/sessions[/revoke-others, /:id] | signed in | Active devices |
| GET | /learner/insights | learner | Streak, XP, level, badges, 84-day activity, review plan |
| GET, POST | /notifications[/read-all, /:id/read] | signed in | In-app notifications |
| GET, POST, DELETE | /announcements[/:id, /:id/pin] | read: all; post: teacher, principal, admin | School news |
| GET, POST, DELETE | /assignments[/:id] | teacher (manage), learner (read own class) | Class tasks |
| GET | /admin/users?q=&role=&page= | admin | Search accounts |
| POST | /admin/users/bulk | admin | CSV import, per-row results |
| PATCH | /admin/users/:id | admin | Edit name, email, class |
| GET/PATCH/DELETE | /admin/parent-links[/:id/consent, /:id] | admin | Links and tutor-chat consent |
| GET | /admin/audit?q=&action=&page= | admin | Filtered audit log |
