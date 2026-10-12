# Architecture — VINSETT Forge AI

## Product boundary
VINSETT Forge AI is a software delivery workspace. It converts an initial product brief into structured planning artifacts and tracks execution, decisions and AI-assisted analysis over time.

## Current boundaries — v0.6.2 / Milestones 1–6
- Public product landing page.
- Email/password identity with `scrypt` password hashing.
- Stateless signed HttpOnly session cookie using HMAC-SHA256.
- PostgreSQL persistence through Drizzle ORM.
- Ownership boundary: every project belongs to exactly one authenticated user.
- Deterministic baseline planning contract and immutable plan snapshots.
- Requirements, acceptance criteria, tasks, Kanban and activity history.
- AI provider adapter with structured proposal output.
- Human-in-the-loop decision boundary before scope mutations.
- Audit metadata for AI provider, model and prompt version.
- Read-only GitHub context, synchronization history and observable release-readiness checks.
- Dedicated Netlify deployment with managed PostgreSQL and AI Gateway.
- Database-aware health endpoint, security headers, process-local abuse guards and PostgreSQL/Chromium CI.

The [2026-10-12 review](PROJECT_STATUS_2026-10-12.md) separates implemented behavior, dated production evidence and pending operational work.

## Authentication model
Passwords are never stored in plaintext. A random salt and `scrypt` derived key are persisted in `users.password_hash`. The browser receives only a signed session token in an HttpOnly, SameSite=Lax cookie. In production, `SESSION_SECRET` must be at least 32 characters and the cookie is Secure.

The current session is stateless: logout removes the browser cookie. Server-side revocation and device/session management are deferred.

## Persistence model
- `users`: identity and password hash.
- `projects`: owner-scoped briefing, lifecycle status and current approved plan.
- `plan_snapshots`: immutable approved plan versions.
- `requirements`: scope items with priority and acceptance criteria.
- `tasks`: executable work linked optionally to a requirement.
- `activity_events`: audit/activity trail.
- `ai_proposals`: generated proposals and human decision metadata.
- `github_integrations`: current repository link and latest synchronization state.
- `github_syncs`: historical GitHub synchronization results.

## AI boundary
The application owns `AiWorkspaceProposal`; the provider must conform to it. A provider response is locally validated even when Structured Outputs are used.

Generation only creates a `pending` proposal. It does not change active scope. Approval is a database transaction that:
1. atomically claims the pending proposal as approved;
2. updates the current plan;
3. creates the next immutable plan snapshot;
4. inserts proposed requirements;
5. inserts proposed tasks and their requirement links;
6. records the audit event.

Rejection records the decision without scope mutation.

## Provider strategy
- `openai`: Responses API with Structured Outputs and versioned prompt instructions.
- `deterministic`: offline-safe fallback using the same domain contract.

Provider failure is surfaced when OpenAI is explicitly configured; it does not silently replace a failed configured call with fabricated AI output.

## GitHub boundary

The adapter reads repository metadata, issues, pull requests, commits and Actions runs. It does not push code, create issues or publish releases. The public deployment uses anonymous access to public repositories; a shared privileged token would not provide per-user authorization to private repositories.

## Current limits and future modules

Identity, projects, requirements, Kanban, AI proposals, GitHub synchronization and activity history are implemented. Organizations/shared ownership, an ADR management module, password recovery and server-side session revocation are not implemented.

Rate limits are process-local. Expanding to broader multi-instance use requires distributed abuse protection and an explicit AI usage/cost policy. The application supports planning and delivery tracking; autonomous code execution and deployment of user projects are outside its current boundary.
