# Validation Report — Milestone 2

Date: 2026-10-01
Version: 0.2.0

## Passed in this environment

- Domain TypeScript check: `tsc -p tsconfig.core.json` — **PASS**.
- Automated test suite: `npm test` — **6 passed, 0 failed**.
- Brief validation and deterministic plan tests — PASS.
- Registration/login input validation tests — PASS.
- Password hashing test verifies random salting and correct/incorrect password behavior — PASS.
- Signed session test verifies valid token, tamper rejection and expiration — PASS.
- Secret hygiene review: real `.env` files remain ignored; only `.env.example` is versioned.
- Persistence boundaries were implemented so project reads/writes require `ownerId` in repository queries.

## Added in Milestone 2

- `users`, `projects` and `plan_snapshots` PostgreSQL schema.
- Baseline SQL migration for an empty database.
- `scrypt` password hashing using Node.js crypto.
- HMAC-SHA256 signed, HttpOnly, SameSite=Lax session cookie.
- Registration, login, logout and current-session API endpoints.
- Authenticated dashboard.
- Owner-scoped project create/list/read/status/delete operations.
- Atomic project + plan snapshot creation.

## Not yet validated in this container

The build container does not currently have the project's npm dependencies installed. An earlier `npm install` attempt could not reach the npm registry. As a result:

- full Next.js `npm run typecheck` was **not executed**;
- `npm run build` was **not executed**;
- UI/browser flows were **not executed**;
- PostgreSQL migration and live repository queries were **not executed** against a database;
- cookie behavior was tested at the cryptographic token level, not through a live browser.

These remain release gates. No production-readiness claim is made until dependencies can be installed and those checks pass.

## Next release gates

1. Install dependencies from npm.
2. Run full `npm run typecheck`.
3. Run `npm test`.
4. Run `npm run build`.
5. Apply migration to disposable PostgreSQL.
6. Execute register → login → create → reopen → status change → delete browser journey.
7. Verify cross-account access returns 404/unauthorized and cannot mutate another user's project.
