# VINSETT Forge AI

**VINSETT Forge AI** is an AI-assisted software delivery workspace designed to turn an initial product idea into a traceable project: structured briefing, planning artifacts, ownership, lifecycle state and, in later milestones, backlog execution, QA evidence and GitHub context.

**Current version:** `0.3.0` — Milestone 3 delivery workspace.

## What works through Milestone 3

- Public product landing page.
- Email/password registration, login and logout.
- Password storage using salted Node.js `scrypt` hashes.
- Signed HttpOnly session cookie with HMAC-SHA256.
- PostgreSQL/Drizzle persistence layer.
- Per-user project ownership boundary.
- Project creation from a validated product brief.
- Deterministic first planning snapshot with epics, stories, risks and Definition of Done.
- Project workspace list and detail screen.
- Project lifecycle status: `draft`, `active`, `paused`, `done`.
- Project deletion scoped to the authenticated owner.
- Requirements with priority and acceptance criteria.
- Tasks linked to requirements when useful.
- Five-stage Kanban workflow: Backlog → Ready → In Progress → Review → Done.
- Activity history for project, requirement and task changes.
- Automated tests for briefing, auth validation, password hashing and signed sessions.
- GitHub Actions workflow prepared for typecheck, tests and production build.

## Product flow

```text
Register / Login
      ↓
Authenticated workspace
      ↓
Structured product brief
      ↓
Validated domain contract
      ↓
Deterministic planning engine
      ↓
PostgreSQL transaction
      ├── project
      └── plan snapshot v1
      ↓
Project detail / lifecycle
      ↓
Requirements + Tasks + Kanban + Activity
```

## Architecture

| Responsibility | Current implementation |
| --- | --- |
| Web UI | Next.js + React + TypeScript |
| Domain | Dependency-free TypeScript contracts |
| Authentication | `scrypt` password hash + HMAC signed HttpOnly cookie |
| Persistence | PostgreSQL + Drizzle ORM |
| Planning | Deterministic adapter behind a stable domain contract |
| CI | GitHub Actions |
| AI provider | Deferred to Milestone 4 |

The deterministic planner is intentional. AI will be added as an adapter to the planning contract rather than becoming the application's domain model.

## Local configuration

Create `.env.local` from `.env.example`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/vinsett_forge
SESSION_SECRET=replace-with-at-least-32-random-characters
AI_PROVIDER=disabled
OPENAI_API_KEY=
```

Never commit `.env.local` or real credentials.

### Database schema

Apply the current baseline migration to an empty PostgreSQL database:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_milestone_2.sql
```

The migration creates `users`, `projects` and `plan_snapshots` plus the `project_status` enum and ownership indexes.

## Run

Requires Node.js 22.13+.

```bash
npm install
npm run typecheck
npm test
npm run dev
```

Production verification:

```bash
npm run build
```

## Tests

The current offline-safe suite verifies:

- project briefing validation;
- deterministic plan completeness;
- registration/login validation;
- password salting and verification;
- session signature tamper detection;
- session expiration.

See [`docs/VALIDATION.md`](docs/VALIDATION.md) for what was and was not executed in the current build environment.

## Repository structure

```text
app/
├── api/
│   ├── auth/           # register, login, logout, current session
│   └── projects/       # owner-scoped CRUD
├── auth/               # login / registration UI
├── dashboard/          # authenticated project workspace
└── projects/           # creation and project detail
src/
├── auth/               # password/session primitives
├── db/                 # Drizzle client + schema
├── domain/             # stable domain contracts
└── repositories/       # persistence boundary
db/migrations/          # SQL migration baseline
tests/                  # offline-safe automated tests
docs/                   # architecture, roadmap, validation
```

## Roadmap

- **M1 — Foundation:** complete.
- **M2 — Persistence + Authentication:** complete in code; production DB/browser validation pending.
- **M3 — Delivery Workspace:** complete in code; live database/browser validation pending.
- **M4 — AI Layer:** provider abstraction, structured AI planning/review, approval boundaries.
- **M5 — GitHub Integration:** repository, issue, commit and PR context.
- **M6 — Production Readiness:** E2E, abuse controls, observability, backup/restore and public demo.

## Security posture

This repository intentionally does not contain API keys, database credentials or a production session secret. Authentication protects project ownership at the repository query boundary, not only in the UI. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for current security assumptions and limitations.
