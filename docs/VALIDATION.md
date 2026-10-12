# Validation Report — v0.6.2 production

## Latest review — 2026-10-12

- [CI run 38209873639](https://github.com/Vinsett07/vinsett-forge-ai/actions/runs/38209873639) passed for source commit `97fa0736b9819eb4eaf39fa7ab223a21db755d44`: four PostgreSQL 17 migrations applied twice, lint, typecheck, 19 unit tests, production build and 3 Chromium tests. Job logs confirm the test counts.
- The live site returned HTTP 200 from `/api/health`, version 0.6.2 and all readiness checks passed. Anonymous `/dashboard` redirected to `/auth`, and `/api/projects` returned 401. Sanitized results: [public checks](evidence/public-check-2026-10-12.json).
- The live landing page, architecture anchor and navigation to the authentication screen were checked in the browser. The [landing capture](assets/forge-landing-2026-10-12.jpg) is from the actual public site.
- Backup restoration is **complete**, with the [2026-10-05 evidence](BACKUP_RESTORE_2026-10-05.md) confirming all nine table fingerprints, schema equivalence, 13 validated foreign keys and no orphans. This was not repeated in the current review.
- All six annotated historical tags passed `bash scripts/publish-historical-tags.sh --verify` again. GitHub's tag refs were empty at review time; publication still needs an authorized Git credential with workflow access.
- Netlify management access requires reauthentication (`oauth_token_invalid_grant`); the supported CLI also reported `NOT_LOGGED_IN`. The two test branches and synthetic acceptance fixture were last recorded as remaining on 2026-10-05; their cleanup could not be rechecked or completed here.
- No new authenticated production session or external AI call was made in this review. The 2026-10-04 HTTP acceptance below remains the evidence for those integrations; the full authenticated live-domain browser journey is still pending.

See the [current status and closeout criteria](PROJECT_STATUS_2026-10-12.md). This review updates documentation and portfolio evidence; it does not represent a new application deployment.

## Production HTTP acceptance — 2026-10-04

- [CI run 37245106626](https://github.com/Vinsett07/vinsett-forge-ai/actions/runs/37245106626) passed for source commit `2794a1ad3614f3c2ae3c795b06f99da20864cfc8`: four PostgreSQL 17 migrations applied twice, lint, typecheck, 19 unit tests, production build and 3 Chromium tests.
- Dedicated [Forge production site](https://vinsett-forge-ai.netlify.app): health HTTP 200, version 0.6.2, session configuration and all nine database tables healthy.
- Production HTTP acceptance passed: registration with Secure/HttpOnly/SameSite cookie, project/requirement/task persistence, GitHub link and synchronization, real external AI response, explicit approval creating snapshot v2, duplicate approval rejected with 409, logout denying access with 401, login restoring the project and its generated plan.
- External AI returned `provider=openai`, `model=gpt-6-astra` and a provider response ID through Netlify AI Gateway. The proposal was pending before approval.
- Landing page and auth screen rendered in the cloud browser. The full browser journey was executed against the CI production build, not the live domain.
- Netlify production migrations and on-publish snapshots were observed. The then-pending restore was subsequently completed on [2026-10-05](BACKUP_RESTORE_2026-10-05.md).
- The six original annotated tags passed local object/commit integrity verification. Publication was blocked because the existing Actions credential lacked workflow permission.

Details: [production record](PRODUCTION_2026-10-04.md). The reports below are historical and do not supersede the latest review above.

---

# Historical recovery — v0.6.1

## 2026-10-04 update

- Original v0.6.0 bundle: complete clone and `git fsck --full` passed.
- Fresh npm dependency installation completed; dependency lockfile added.
- Full Next.js type generation and TypeScript check passed.
- ESLint passed after correcting the recovered source.
- Node domain/auth/AI/GitHub tests: 18 passed, zero failures.
- Next.js production build passed.
- Expanded Playwright acceptance covers registration/login/logout, persisted project and Kanban changes, owner isolation, approval/rejection, duplicate and concurrent approvals, and project deletion.
- Local PostgreSQL provisioning and Chromium download could not complete in this container. PostgreSQL 17 migrations and browser execution are delegated to the repository CI; see [Actions](https://github.com/Vinsett07/vinsett-forge-ai/actions/workflows/ci.yml) for the execution result.
- Public production deployment, deployed live GitHub sync, real OpenAI request and backup/restore rehearsal remain pending.

The dated v0.6.0 report below is historical; it does not override the results above.

---

# Historical report — Milestones 5 and 6

Date: 2026-10-01
Version: 0.6.0

## Passed in this environment

- Domain TypeScript check: `tsc -p tsconfig.core.json` — PASS.
- Automated Node test suite — see latest command output; zero failures.
- GitHub repository reference parsing — PASS.
- GitHub REST adapter with mocked repository/issues/PR/commit/Actions responses — PASS.
- Filtering pull requests out of the Issues endpoint — PASS.
- Release-readiness checks for clean state, blocker labels and failed CI — PASS.
- Fixed-window abuse guard — PASS.
- Existing auth, session, planning, delivery and AI proposal tests remain passing.
- `git diff --check` is executed before release checkpoint.

## Milestone 5 implemented

- `github_integrations` current-link persistence.
- `github_syncs` audit history.
- Read-only GitHub REST adapter using API version `2026-03-10`.
- Public repository support without token and optional server-side `GITHUB_TOKEN`.
- Issues, PRs, default-branch commits and Actions workflow run context.
- GitHub API rate-limit metadata surfaced in the workspace.
- Link, sync and unlink APIs with owner boundaries.
- Release-readiness UI with factual checks rather than opaque scoring.
- Activity events for link/sync/failure/unlink.

## Milestone 6 implemented

- Response security headers in Next config.
- Process-local abuse guards on login, registration, AI proposal generation and GitHub sync.
- Database-aware `/api/health` readiness endpoint.
- Ordered SQL migration runner.
- GitHub Actions pipeline with PostgreSQL 17 service, migration, full typecheck, tests, build and Chromium E2E.
- Playwright 1.63.0 smoke specifications.
- Dockerfile and `.dockerignore`.
- Netlify configuration for Node 22 / Next.js build.
- Backup/restore and production operations runbook.
- Portfolio case study.

## External release gates not yet claimed

This working container has previously been unable to complete a fresh npm dependency installation. Until a network-enabled environment completes the following, the report does not claim them as passed:

1. full project `npm run typecheck`;
2. `npm run build`;
3. migrations `0001`–`0004` against disposable PostgreSQL;
4. Playwright browser execution (`npm run test:e2e`);
5. live GitHub synchronization from the deployed application;
6. one real OpenAI Structured Output request when an API key is configured;
7. public production deployment and `/api/health` verification.

## Deployment acceptance

A production release is accepted only after CI is green, the production database is backed up, all migrations apply successfully, the deployed `/api/health` returns HTTP 200 and a browser smoke run verifies landing/auth plus an authenticated project journey.
