# Roadmap

## M1 — Foundation ✅
- Product positioning and UX shell.
- Brief validation.
- Deterministic planning API.
- Domain tests.
- Database schema seed.
- CI.

## M2 — Persistence + Authentication ✅
- PostgreSQL connection and migration.
- User registration/login/logout.
- Password hashing and signed HttpOnly sessions.
- Project CRUD with ownership boundaries.
- Saved planning snapshot V1.
- Auth/domain automated tests.

## M3 — Delivery Workspace ✅
- Requirements with priority and acceptance criteria.
- Tasks optionally linked to requirements.
- Five-stage Kanban workflow.
- Activity history for project, requirement and task changes.
- Owner-scoped delivery APIs and repository boundaries.

## M4 — AI Layer ✅ code complete
- OpenAI Responses API adapter using Structured Outputs.
- Deterministic offline fallback behind the same contract.
- Local validation of every generated proposal.
- Prompt/version/provider/model audit metadata.
- Pending proposal review UI.
- Explicit approve/reject flow.
- Atomic application of approved plan + snapshot + requirements + tasks.

## M5 — GitHub Integration ✅ code complete
- Read-only repository linking and unlinking.
- Issues, pull requests, commits and GitHub Actions synchronization.
- Sync history and activity audit events.
- Release-readiness checks based on observable repository state.
- Optional server-side GitHub token; public repositories work anonymously.

## M6 — Production Readiness ✅ code complete / external deploy pending
- Playwright browser smoke specifications.
- Authentication, AI and GitHub sync abuse guards.
- Security response headers.
- Database-aware `/api/health` endpoint.
- PostgreSQL migration runner and CI service database.
- Production build + E2E GitHub Actions pipeline.
- Backup/restore runbook, Dockerfile and Netlify configuration.
- Portfolio case study.
- Public production deployment remains an external release gate.
