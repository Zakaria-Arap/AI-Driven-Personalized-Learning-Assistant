# Prototype and project parity

The standalone prototype (`npm run build:prototype`) is built from the same React source as the real app. Only the
network layer differs: `frontend/prototype/mockClient.js` replaces `src/api/client.js`, and `prototype/mock/server.js`
answers the same routes inside the browser. It imports the real learning engines (mastery, recommendation, marking,
streaks and badges, hint ladder, answer guard, password policy), so behaviour matches.

| Area | Real project | Prototype |
|---|---|---|
| Screens, layout, sidebar, top bar, footer, mobile drawer, dark mode, i18n, command palette | yes | identical (same code) |
| Sign in, activate, lockout, forgot/reset, Google "not registered" | yes (database, bcrypt, cookies) | yes (demo code 482917) |
| Branding studio with logo upload, live preview, contrast rule | yes (saved in MySQL, `/uploads`) | yes (saved in browser) |
| Profiles: photo, preferences, notifications, sessions, password | yes | yes |
| Learner dashboard, practice, hint tutor, flags, badges, reviews | yes | yes |
| Teacher, parent, principal dashboards; assignments; announcements; notifications | yes | yes |
| Subjects: 11 core subjects x Grades 10-12, pathways and electives, one teacher per subject and teacher-scoped views, multiple-choice practice, admin Subjects page | yes | yes (same question bank, same rules) |
| Admin accounts, CSV import, links and consent, audit log | yes | yes |
| Real persistence, multi-user, email, real AI model | yes | no (single browser, scripted tutor) |
| Real Google sign-in button | when `GOOGLE_CLIENT_ID` set | no |
| Automated tests | 44 | n/a |

If a screen differs, the project is the source of truth: rebuild the prototype.
