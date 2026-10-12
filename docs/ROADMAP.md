# Roadmap

Reviewed 2026-10-12. M1–M6 are implemented and v0.6.2 is deployed at the [dedicated Forge site](https://vinsett-forge-ai.netlify.app/). See the [current status](PROJECT_STATUS_2026-10-12.md) for evidence dates and unresolved operational work.

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

## M4 — AI Layer ✅ implemented and externally validated
- OpenAI Responses API adapter using Structured Outputs.
- Deterministic offline fallback behind the same contract.
- Local validation of every generated proposal.
- Prompt/version/provider/model audit metadata.
- Pending proposal review UI.
- Explicit approve/reject flow.
- Atomic application of approved plan + snapshot + requirements + tasks.
- Real external AI generation and owner approval verified in production on 2026-10-04.

## M5 — GitHub Integration ✅ implemented and externally validated
- Read-only repository linking and unlinking.
- Issues, pull requests, commits and GitHub Actions synchronization.
- Sync history and activity audit events.
- Release-readiness checks based on observable repository state.
- Optional server-side GitHub token; public repositories work anonymously.
- Public repository linking and synchronization verified in production on 2026-10-04.

## M6 — Production Readiness ✅ implemented / operational closeout remains
- Playwright browser smoke specifications.
- Authentication, AI and GitHub sync abuse guards.
- Security response headers.
- Database-aware `/api/health` endpoint.
- PostgreSQL migration runner and CI service database.
- Production build + E2E GitHub Actions pipeline.
- Backup/restore runbook, Dockerfile and Netlify configuration.
- Portfolio case study.
- Dedicated Netlify production deployment, managed PostgreSQL and AI Gateway validated.
- Existing production backup restored into an isolated branch on 2026-10-05; all nine tables, schema fingerprints and 13 relationships matched.
- Public health, landing/auth navigation and current CI rechecked on 2026-10-12.

## Remaining operational work

- Publish the six original annotated historical tags with workflow-authorized Git credentials. Their objects and commits are preserved and locally verified.
- Remove the two disposable restore branches through the authenticated Netlify dashboard and remove only the synthetic production acceptance fixture through a reviewed data migration. Access must be restored first.
- Complete the authenticated browser journey on the live domain. CI covers the full browser journey; production's authenticated acceptance evidence is HTTP-based.

## Future product evolution — not implemented

Organizations/shared projects, password recovery, session revocation and distributed abuse controls are outside the current MVP. Evaluate these before expanding access or scale; they are not presented as delivered features. Consult the [open-source toolkit](OPEN_SOURCE_TOOLKIT.md) when a concrete requirement warrants an additional dependency.
