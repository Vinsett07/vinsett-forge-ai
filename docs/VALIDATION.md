# Validation Report — Milestones 5 and 6

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
