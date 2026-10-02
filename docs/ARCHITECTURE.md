# Architecture — VINSETT Forge AI

## Product boundary
VINSETT Forge AI is a software delivery workspace. It converts an initial product brief into structured planning artifacts and tracks execution, decisions, QA evidence and AI-assisted analysis over time.

## Current boundaries — Milestone 2
- Public product landing page.
- Email/password identity with password hashing via Node.js `scrypt`.
- Stateless, signed, HttpOnly session cookie using HMAC-SHA256.
- PostgreSQL persistence through Drizzle ORM.
- Ownership boundary: every project belongs to exactly one authenticated user.
- Structured project brief and deterministic planning contract.
- Version 1 planning snapshot created atomically with the project.
- Project list, detail page, lifecycle status and deletion.
- Automated domain/auth tests and GitHub Actions CI.

## Authentication model
Passwords are never stored in plaintext. A random salt and `scrypt` derived key are persisted in `users.password_hash`. The browser receives only a signed session token in an HttpOnly, SameSite=Lax cookie. In production, `SESSION_SECRET` must be at least 32 characters and the cookie is Secure.

The current session is stateless: logout removes the browser cookie. Server-side session revocation and device/session management are intentionally deferred until they become a product requirement.

## Persistence model
- `users`: identity and password hash.
- `projects`: owner-scoped briefing, current status and current plan.
- `plan_snapshots`: immutable versioned copies of generated plans.

Project creation and its initial plan snapshot run in one database transaction.

## Why deterministic planning remains
The AI layer must not become the domain model. The application owns the planning contract; an AI provider will later implement the same interface. This keeps tests deterministic, enables provider substitution and prevents core behavior from depending on prompt wording.

## Planned modules
1. Identity and organizations.
2. Projects and briefs.
3. Requirements and acceptance criteria.
4. Backlog and Kanban workflow.
5. Architecture decisions (ADR).
6. AI planning/review adapters.
7. QA evidence and release readiness.
8. GitHub synchronization.
9. Audit trail and activity feed.
