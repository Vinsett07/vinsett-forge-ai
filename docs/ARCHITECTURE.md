# Architecture — VINSETT Forge AI

## Product boundary
VINSETT Forge AI is a software delivery workspace. It converts an initial product brief into structured planning artifacts and, in later milestones, tracks execution, decisions, QA evidence and AI-assisted analysis.

## Milestone 1 boundaries
- Public landing page.
- Structured project brief.
- Validated dependency-free domain contract.
- Deterministic planning engine for offline, reproducible behavior.
- API route exposing the planning contract.
- Initial PostgreSQL schema using Drizzle ORM.
- Automated domain tests and GitHub Actions CI.

## Why deterministic planning first
The AI layer must not become the domain model. The application owns the contract; an AI provider will later implement the same planning interface. This keeps tests deterministic, allows provider substitution and avoids coupling core behavior to a prompt.

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
