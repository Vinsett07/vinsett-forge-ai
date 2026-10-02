# VINSETT Forge AI

**VINSETT Forge AI** is an AI-assisted software delivery workspace that turns a product idea into a traceable project: briefing, planning snapshots, requirements, backlog, Kanban execution, audit history and human-reviewed AI proposals.

**Current version:** `0.4.0` — Milestone 4 AI layer.

## What works through Milestone 4

- Public product landing page.
- Email/password registration, login and logout.
- Password storage using salted Node.js `scrypt` hashes.
- Signed HttpOnly session cookie with HMAC-SHA256.
- PostgreSQL/Drizzle persistence layer.
- Per-user project ownership boundary.
- Project creation from a validated product brief.
- Deterministic first planning snapshot with epics, stories, risks and Definition of Done.
- Project lifecycle status: `draft`, `active`, `paused`, `done`.
- Requirements with priority and acceptance criteria.
- Tasks optionally linked to requirements.
- Five-stage Kanban workflow: Backlog → Ready → In Progress → Review → Done.
- Activity history for project, requirement, task and AI decisions.
- OpenAI Responses API adapter using Structured Outputs when configured.
- Deterministic AI fallback when no external API key is available.
- AI proposal audit metadata: provider, model, prompt version and provider response ID.
- Human approval/rejection before AI-generated scope is applied.
- Atomic approval transaction for new plan snapshot + requirements + tasks.
- Offline-safe automated domain/auth/AI proposal tests.
- GitHub Actions workflow prepared for typecheck, tests and production build.

## Product flow

```text
Register / Login
      ↓
Authenticated workspace
      ↓
Structured product brief
      ↓
Deterministic baseline plan + snapshot v1
      ↓
Requirements + Tasks + Kanban + Activity
      ↓
Generate AI proposal
      ↓
Pending review (NO scope mutation)
      ↓
Human decision
   ┌─────────────┴─────────────┐
Reject                      Approve
   ↓                            ↓
Audit only          Atomic DB transaction
                    ├── current plan
                    ├── next plan snapshot
                    ├── requirements
                    ├── tasks
                    └── audit event
```

## Architecture

| Responsibility | Current implementation |
| --- | --- |
| Web UI | Next.js + React + TypeScript |
| Domain | Dependency-free TypeScript contracts |
| Authentication | `scrypt` password hash + HMAC signed HttpOnly cookie |
| Persistence | PostgreSQL + Drizzle ORM |
| Baseline planning | Deterministic domain adapter |
| AI planning | OpenAI Responses API + Structured Outputs, with deterministic fallback |
| AI safety boundary | Pending proposal + explicit human approval |
| Auditability | Prompt version, provider, model, response ID, decision actor/time |
| CI | GitHub Actions |

The AI provider never owns the domain contract and never writes project scope directly.

## Local configuration

Create `.env.local` from `.env.example`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/vinsett_forge
SESSION_SECRET=replace-with-at-least-32-random-characters
AI_PROVIDER=openai
OPENAI_MODEL=gpt-6-astra
OPENAI_API_KEY=
```

Without `OPENAI_API_KEY`, proposal generation automatically uses the deterministic fallback. Never commit `.env.local` or real credentials.

## Database migrations

Apply migrations in order:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_milestone_2.sql
psql "$DATABASE_URL" -f db/migrations/0002_delivery_workspace.sql
psql "$DATABASE_URL" -f db/migrations/0003_ai_layer.sql
```

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
- session signature tamper detection and expiration;
- requirements, acceptance criteria and Kanban status validation;
- AI proposal local schema validation;
- invalid requirement references in proposed tasks;
- duplicate proposal requirement keys;
- deterministic AI fallback validity.

See [`docs/VALIDATION.md`](docs/VALIDATION.md) for executed and blocked release gates.

## Repository structure

```text
app/
├── api/
│   ├── auth/
│   └── projects/       # CRUD, delivery and AI proposal decisions
├── auth/
├── dashboard/
└── projects/
src/
├── ai/                 # provider adapter + versioned prompt
├── auth/
├── db/
├── domain/             # stable contracts, including AI proposal validation
└── repositories/
db/migrations/
tests/
docs/
```

## Roadmap

- **M1 — Foundation:** complete.
- **M2 — Persistence + Authentication:** complete in code; live DB/browser validation pending.
- **M3 — Delivery Workspace:** complete in code; live DB/browser validation pending.
- **M4 — AI Layer:** complete in code; real provider/database/browser validation pending.
- **M5 — GitHub Integration:** repository, issue, commit and PR context.
- **M6 — Production Readiness:** E2E, abuse controls, observability, backup/restore and public demo.

## Security posture

This repository contains no real API keys, database credentials or production session secrets. Project authorization is enforced at the repository boundary. AI-generated output is locally validated and remains pending until a human explicitly approves it. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/AI_LAYER.md`](docs/AI_LAYER.md).
