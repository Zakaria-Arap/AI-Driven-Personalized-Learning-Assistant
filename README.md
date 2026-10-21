# Somo - AI-Driven Personalized Learning Assistant

Kenya CBC senior school, Grades 10-12. Covers the **11 core subjects** (English, Kiswahili, Core Mathematics, Biology, Chemistry, Physics, Computer Science, History and Citizenship, Geography, CRE, Business Studies) for all three grades. Every subject has its own teacher.
Express + Sequelize + MySQL backend, Vite + React frontend, school-issued logins (no public sign-up).

```
somo/
├─ backend/     Express API (the main part). See backend/README.md
├─ frontend/    Vite + React web app (responsive: laptop, tablet, phone)
│   └─ prototype/   builds the standalone click-through prototype (same screens, fake server in the browser)
├─ docs/        Architecture and API notes (put D1-D4 here too)
└─ docker-compose.yml   MySQL for local development
```

## Run it (Windows / Git Bash, macOS, Linux)

Needs Node 18+ and either Docker or a local MySQL 8.

```bash
# 1. database
docker compose up -d                 # starts MySQL (db somo_dev, user somo / somopass)

# 2. backend
cd backend
cp .env.example .env                 # then set JWT_SECRET to a long random string
npm install
npm run db:migrate                   # creates the tables
npm run db:seed                      # demo school, accounts, all subjects for Grades 10-12, a teacher for every subject, 6 weeks of demo practice, announcements
npm run dev                          # API on http://localhost:4000/api

# 3. frontend (new terminal)
cd frontend
npm install
npm run dev                          # app on http://localhost:5173
```

Run the tests with `cd backend && npm test`. Most need no database; `tests/integration/subjects.db.test.js` uses the seeded dev database and skips itself if it is not reachable.

**Upgrading an existing database:** run `npm run db:migrate` (adds profile, branding, session, notification,
announcement, assignment, badge, course and enrolment tables) and `npm run db:seed` again. Both are safe to repeat.

## Standalone prototype

`cd frontend && npm run build:prototype` writes `prototype-dist/`. Open its `index.html` by double-click: the same
screens as the real app, with a small mock server inside the browser (no install, no database). Use it to compare
design and flows with the real app. Details in `docs/PARITY.md`.

## Demo accounts (seeded)

| School ID | Role | Password | Note |
|---|---|---|---|
| AMA-10B-014 | Learner (Amani) | Welcome-2026 | temporary: must activate first |
| BRM-10B-007 | Learner (Brian) | Welcome-2026 | temporary, has some progress |
| ZAK-10B-021 | Learner (Zawadi) | Welcome-2026 | temporary, has some progress |
| TCH-0231 | Teacher | Chalk#2026 | |
| PAR-0872 | Parent of Amani | Family#2026 | |
| PRN-0001 | Principal | Lead#2026 | |
| ADM-0001 | Administrator | Office#2026 | issues accounts |

Subject accounts (all seeded; learners marked * are ready to use without activation):

| School ID | Password | Role |
|---|---|---|
| LEARNER * | learner@1234 | STEM learner, Grade 10: Biology, Chemistry, Physics |
| TEACHER | teacher@1234 | Core Mathematics teacher |
| TCH-0231 | Chalk#2026 | Physics teacher (Mr Kamau) |
| TCH-ENG, TCH-KIS, TCH-BIO, TCH-CHEM, TCH-CS, TCH-HIST, TCH-GEO, TCH-CRE, TCH-BUS | teacher@1234 | the teacher of that subject |
| MAT-11A-003 * | Learn#2026 | STEM learner, Grade 11 |
| KOC-12A-009 * | Learn#2026 | Social Sciences learner, Grade 12 |

Forgot-password codes are printed in the backend console while `NODE_ENV=development` (no email is sent yet).

## Subjects, pathways and teachers

- **Compulsory** for everyone: English, Kiswahili, Core Mathematics. **STEM** electives: Biology, Chemistry, Physics, Computer Science. **Social Sciences** electives: History and Citizenship, Geography, CRE, Business Studies.
- A learner picks one pathway and up to 3 electives from it (their own choice on *My subjects*, or the admin sets it for them). They see and practise only their own subjects, in their own grade.
- Each subject (a *course*) has **one teacher**, assigned by the admin on *Subjects*. A teacher sees only the learners enrolled in their subject (one grade at a time, optionally one class), sets tasks only in that subject, and receives flagged tutor chats only from it. If a subject has no teacher yet, flags go to every teacher so nothing is missed.
- Parents see every subject of their child with its teacher. The principal sees averages per class and per subject, with no learner names.
- Questions are multiple choice or numeric. The starter question bank for every subject is `reviewed = false`: the subject teacher should review and extend it before real use.

## The AI tutor

`AI_PROVIDER=mock` (default) works offline with scripted hints. To use a real model set
`AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY` and `AI_MODEL` in `backend/.env`.
The five-level hint ladder and the answer filter run on the server either way, so a learner
cannot get the final answer before level 5.

## What is built / what is not

**Built**
- School-issued auth: activate with temporary password, lockout (5 tries), 6-digit reset code, Google sign-in for registered emails only (button appears when `GOOGLE_CLIENT_ID` is set), server-side sessions with "sign out other devices".
- Five role areas with sidebar, top bar, footer, mobile drawer, Ctrl+K command palette, toasts, skeleton loading, dark mode, English and Kiswahili.
- **School branding** (admin and principal): name, tagline, logo upload, main and accent colours (with a readability check), light/dark default, corner style, font style, footer text, support email. Live preview, applies to everyone.
- **Profiles** for every user: photo, display name, email, phone, bio, appearance (mode, text size, density, reduced motion), language, notification choices, daily goal, password change, active devices.
- Learner: streak, XP and levels, 9 badges, 12-week practice calendar, review plan, class tasks, five-level hint tutor with answer protection and wellbeing flags.
- Teacher: class heat map, learner table, assignments, flagged-chat review. Parent: weekly summary and 14-day activity. Principal: class and topic charts, announcements.
- Admin: issue accounts, CSV bulk import, edit, disable, new temporary password, parent links and chat consent, searchable audit log.
- **Subjects**: 11 core subjects x Grades 10-12 (136 topics, 408 starter questions), pathways and electives, one teacher per subject, subject-scoped dashboards, tasks, flags and notifications, multiple-choice practice.
- Announcements and in-app notifications. PWA manifest. 44 automated tests.

**Not yet**: reset codes by real email, a reviewed question bank (seeded questions are `reviewed = false`), parent push/SMS alerts, deployment scripts. In production, serve the frontend and API from one origin (or a reverse proxy) so the session cookie and `/uploads` stay same-origin, and allow Google's script in the CSP if you use Google sign-in.
