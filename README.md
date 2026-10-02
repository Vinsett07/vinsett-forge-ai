# VINSETT Forge AI

AI-assisted software delivery workspace that turns product ideas into structured requirements, backlog-ready plans and traceable delivery artifacts.

## Current milestone
**M1 — Foundation**

This version deliberately starts with a deterministic planning engine rather than an AI call. The domain contract is stable and testable; a model provider will be introduced behind the same interface in a later milestone.

## Stack
- Next.js 16.3.8 (Active LTS)
- React 19.3
- TypeScript
- PostgreSQL model + Drizzle ORM
- Vitest
- GitHub Actions

## Run locally
```bash
npm install
npm run dev
```

Verification:
```bash
npm run typecheck
npm test
npm run build
```

## Product flow
`Brief → validation → planning contract → epics/stories/risks/DoD → persistence (M2) → delivery workspace (M3) → AI review (M4)`

## Repository quality goals
- No secrets committed.
- Domain rules testable without external services.
- AI is an adapter, not a source of truth.
- Every milestone has explicit acceptance criteria.
- Production claims must be backed by test or deployment evidence.

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.
