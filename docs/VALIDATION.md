# Validation Report — Milestone 3

Date: 2026-10-01
Version: 0.3.0

## Passed in this environment

- Domain TypeScript check: `tsc -p tsconfig.core.json` — **PASS**.
- Automated test suite: `npm test` — **9 passed, 0 failed**.
- Product brief validation and deterministic plan generation — PASS.
- Registration/login input validation — PASS.
- Password hashing verifies random salting and correct/incorrect password behavior — PASS.
- Signed session verifies valid token, tamper rejection and expiration — PASS.
- Requirement validation verifies acceptance criteria and bounded content — PASS.
- Task validation and Kanban status allow-list — PASS.
- `git diff --check` — PASS before checkpoint creation.
- Secret hygiene review: no real credential is intentionally versioned; `.env.example` contains placeholders only.

## Milestone 2 implemented

- PostgreSQL users/projects/plan snapshots.
- `scrypt` password hashing.
- HMAC-SHA256 signed HttpOnly session cookie.
- Registration, login, logout and current-session APIs.
- Authenticated project workspace.
- Owner-scoped project CRUD and atomic project + plan snapshot creation.

## Milestone 3 implemented

- `requirements` table with priority and JSON acceptance criteria.
- `tasks` table with optional requirement link and workflow status.
- `activity_events` audit/history table.
- Owner-scoped creation of requirements and tasks.
- Task movement across `backlog`, `ready`, `in_progress`, `review` and `done`.
- Activity events for project creation/status changes, requirement creation, task creation and task movement.
- Project detail screen now includes requirement cards, task creation, five-column Kanban and recent activity.

## External-environment blocker

A fresh dependency installation was retried on 2026-10-01 and failed before package download because DNS resolution for `registry.npmjs.org` returned `EAI_AGAIN`. Therefore the container still cannot install the declared Next.js/React/Drizzle dependencies.

Because of that infrastructure limitation:

- full project `npm run typecheck` is **not executed**;
- `npm run build` is **not executed**;
- browser UI flows are **not executed**;
- PostgreSQL migrations are **not executed** against a live database;
- cross-account authorization is implemented in repository filters but not yet integration-tested against PostgreSQL.

No production-readiness claim is made until these release gates pass in an environment with npm and PostgreSQL access.

## Next release gates

1. Install dependencies from npm.
2. Run full `npm run typecheck` and `npm run build`.
3. Apply migrations `0001` and `0002` to disposable PostgreSQL.
4. Execute two-user authorization tests proving cross-account project, requirement and task access is denied.
5. Run browser journey: register → create project → requirement → task → move task → reopen → logout/login.
6. Then begin Milestone 4 AI provider integration.
