# Architecture — VINSETT Forge AI

## Product boundary
VINSETT Forge AI is a software delivery workspace. It converts an initial product brief into structured planning artifacts and tracks execution, decisions and AI-assisted analysis over time.

## Current boundaries — Milestone 4
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
