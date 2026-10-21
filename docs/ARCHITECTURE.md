# Architecture (as built)

Browser (React/Vite) -- HTTPS/JSON, httpOnly session cookie --> Express API -- SQL --> MySQL
                                                                 |
                                                                 +--> AI model API (tutor replies only)
                                                                 +--> Google tokeninfo (registered emails only)

Differences from D3 v1: the app is split into `backend/` (Express) and `frontend/` (Vite + React) instead of one
Next.js app, and authentication is our own (JWT in an httpOnly cookie, bcrypt, 5-attempt lockout) instead of Clerk.
Update D3 section 2 and decision DD-03 to match.

## Learning engine
- Score per learner and topic, 0-100. Running score: new = old + 0.35 x (answer value - old).
- Answer value: 0 if wrong; 100 minus 15 per hint if correct (minimum 40).
- Bands: Not started, Learning (< 50), Nearly there (50-79), Mastered (80+).
- Mastered topics are reviewed after 1, 3, 7 then 21 days; a wrong review answer resets to 1 day.
- Next step order: due review, topic in progress, next new topic whose prerequisites are at 50%+.

## Tutor safety
1. Hint level is stored on the server per session and moves one step per request (1 Nudge ... 5 Full solution).
2. The reference solution is added to the prompt only at level 5.
3. Every reply is checked; below level 5 a reply containing the answer is replaced with a safe fallback and logged.
4. Messages about harm or off-topic content are flagged; teachers may open flagged chats only.
5. Daily message limit per learner.

## Subjects, pathways and teachers (added)
- Tables: `courses` (one row per school and subject: code, name, pathway, `teacher_id`), `enrolments` (learner x elective course), `subjects.course_code` and `users.pathway`. Curriculum is stored per grade: a subject row such as `PHY11` belongs to course `PHY`, so a topic knows its course and grade.
- Rule set in `services/subjects/subjectService.js`: compulsory courses apply to every learner; an elective applies when it is in the learner's pathway and enrolled. A learner is limited to topics of their own subjects and grade (practice, answers and tutor sessions all check this). A teacher is limited to the courses where `teacher_id` is theirs (dashboard, tasks, flagged-chat transcripts).
- Curriculum files live in `backend/src/seeders/data/courses/` (one file per course, three grades each). `utils/courseImport.js` loads them idempotently.
- Question types: `numeric` (fractions and decimals, with tolerance) and `choice` (the learner picks an option; marked by the option text, so shuffling cannot break it). Options are sent to the browser, the answer is not.
- The tutor prompt and mock hints are subject-neutral; the subject name is passed in.

## Privacy
- Parents see summaries of linked children only; tutor chats need `can_view_tutor_chats` recorded by the school.
- Principals see class and subject totals, never individual names.
- A subject teacher sees only learners enrolled in that subject, and only flagged tutor chats from it.
- Every sensitive read (parent views) and every account action is written to `audit_logs`.

## Branding, profiles and sessions (added)
- `school_settings` holds one row per school. The sign-in page reads it without a session, so the school's name, logo and colours show before login. Colours are applied as CSS variables; a main colour that fails the 4.5:1 contrast test with white text is rejected by the API and blocked in the editor.
- Images are accepted only as PNG, JPEG or WebP data URLs, size-limited, re-saved under `backend/uploads/`, and served with `nosniff`. SVG is refused (script risk).
- Every sign-in creates a `user_sessions` row and the JWT carries its id, so "sign out other devices" and password changes take effect on the next request.
- Learner preferences (theme, text size, density, reduced motion, language, daily goal, notification toggles) live in `users.prefs` and are applied instantly in the browser, saved in the background.
- Gamification (streak, XP, level, badges) is computed from attempts by a pure function; nothing extra to keep in sync.
