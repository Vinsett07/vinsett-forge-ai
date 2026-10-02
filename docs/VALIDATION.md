# Validation Report — Milestone 4

Date: 2026-10-01
Version: 0.4.0

## Passed in this environment

- Domain TypeScript check: `tsc -p tsconfig.core.json` — **PASS**.
- Automated test suite — **13 passed, 0 failed**.
- Product brief validation and deterministic plan generation — PASS.
- Registration/login input validation — PASS.
- Password hashing verifies random salting and correct/incorrect password behavior — PASS.
- Signed session verifies valid token, tamper rejection and expiration — PASS.
- Requirement validation verifies acceptance criteria and bounded content — PASS.
- Task validation and Kanban status allow-list — PASS.
- Deterministic AI proposal validates against the application contract — PASS.
- Proposal task linked to unknown requirement key is rejected — PASS.
- Duplicate proposed requirement keys are rejected — PASS.
- Provider adapter deterministic fallback without an OpenAI key — PASS.
- `git diff --check` — release gate executed before checkpoint.
- Secret hygiene: `.env.example` contains placeholders only; no real provider key is intentionally versioned.

## Milestone 4 implemented

- `AiWorkspaceProposal` application-owned contract.
- OpenAI Responses API adapter using `text.format` Structured Outputs.
- Versioned planner instructions: `forge-planner-v1`.
- Deterministic fallback for offline/no-key development.
- Local validation of model output before persistence.
- `ai_proposals` persistence and migration.
- Provider/model/prompt/response-ID audit metadata.
- Proposal generation API.
- Explicit approve/reject API.
- Atomic approved-scope application with next plan snapshot.
- Project UI for proposal generation, review and decisions.
- AI decision events in the activity feed.

## External-environment blockers

The container still has no installed Next.js/React/Drizzle `node_modules`. A prior fresh dependency installation failed because DNS resolution for `registry.npmjs.org` returned `EAI_AGAIN`.

Therefore these release gates are still not claimed:

- full project `npm run typecheck`;
- `npm run build`;
- migration `0003_ai_layer.sql` against live PostgreSQL;
- real OpenAI API request with a user-owned key;
- browser flow for proposal generation/review/approval;
- two-user integration tests proving cross-account denial.

## Next release gates

1. Install declared npm dependencies in a network-enabled environment.
2. Run full typecheck + production build.
3. Apply migrations `0001`–`0003` to disposable PostgreSQL.
4. Run two-user authorization tests.
5. Configure a non-production OpenAI key and validate one Structured Output response.
6. Browser journey: register → create project → generate proposal → inspect → reject; repeat → approve → verify snapshot/requisites/tasks → logout/login.
7. Proceed to Milestone 5 GitHub integration.
