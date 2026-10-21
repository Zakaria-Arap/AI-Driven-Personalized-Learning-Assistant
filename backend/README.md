# Somo backend

Layers (a request flows top to bottom; nothing skips a layer):

```
routes/        URL -> middleware -> controller
middleware/    requireAuth, requireRole, requireConsent, rateLimit, validate, errorHandler
validators/    Zod schemas for every request body/param
controllers/   thin: read request, call a service, send response
services/      ALL business rules (auth, admin, ai, learner, recommendation, assessment, dashboard, audit)
repositories/  the only code that talks to Sequelize
models/        Sequelize models + associations (models/index.js)
config/        env, database (sequelize-cli), auth rules, ai, learning constants
templates/     AI prompt templates
migrations/ seeders/   schema changes and demo/curriculum data
scripts/       one-off tasks: createAdmin.js, importCbcData.js
tests/         unit (pure rules) and integration (HTTP)
```

Rules of the house
- Business rules go in `services/`, never in controllers or routes.
- Only `repositories/` imports models. Services receive plain data.
- Pure logic (mastery, recommendations, marking, answer guard) takes values in and returns values out, so it is easy to test.
- New schema change = new migration file. Never edit a migration that has been run.
- Errors: throw `AppError` helpers from `utils/errors.js`; `errorHandler` formats them.

Useful commands: `npm run dev`, `npm test`, `npm run db:migrate`, `npm run db:seed`, `npm run db:reset`,
`npm run admin:create -- DEMO ADM-0002 "Name" email@school.ke TempPass-1`, `npm run cbc:import -- path/to/file.json`, `npm run courses:import [SCHOOL_CODE]`.
