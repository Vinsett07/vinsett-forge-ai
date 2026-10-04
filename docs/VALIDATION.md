# Validation Report — v0.6.1 recovery

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
