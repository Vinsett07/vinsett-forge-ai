# VINSETT Forge AI — Portfolio Case Study

## Problem

Software ideas often jump directly from a loose request to implementation, creating ambiguous requirements, disconnected tasks and poor traceability.

## Product

VINSETT Forge AI is a software delivery workspace that turns a structured brief into a versioned plan, requirements, acceptance criteria and executable work. AI can propose scope changes, but a human must review and approve them before persistence.

## Engineering highlights

- Next.js App Router + React + TypeScript.
- PostgreSQL persistence with Drizzle ORM and ordered SQL migrations.
- Password hashing with scrypt and signed HttpOnly sessions.
- Per-user ownership boundaries across projects and delivery data.
- Five-stage Kanban, acceptance criteria and activity audit trail.
- OpenAI Responses API adapter with Structured Outputs plus deterministic offline fallback.
- Human approval gate for AI-generated scope.
- Read-only GitHub context: issues, PRs, commits and Actions runs.
- Observable release-readiness checks rather than opaque scoring.
- Health endpoint, security headers, abuse guards, CI, E2E specification and operational runbook.

## Quality strategy

Pure domain behavior is covered by Node's test runner. Browser smoke journeys are specified with Playwright. CI provisions PostgreSQL, applies migrations, runs the full TypeScript check, unit/domain tests, production build and Chromium E2E suite.

## Security decisions

Secrets are server-side only. GitHub integration is read-only by default. AI changes never write project scope without explicit user approval. Sessions are HttpOnly, SameSite=Lax and Secure in production.

## Release state

The repository is production-oriented but deployment evidence must remain separate from code readiness. A release is considered externally validated only after CI passes in a network-enabled environment, migrations run on a disposable PostgreSQL database, browser E2E passes and a production host reports healthy through `/api/health`.
