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

## M5 — GitHub Integration
- Repository linking.
- Issue synchronization.
- Commit/PR context.
- Release readiness dashboard.

## M6 — Production Readiness
- E2E tests.
- Rate limiting and abuse controls.
- Observability.
- Backup/restore procedure.
- Public demo environment and portfolio case study.
