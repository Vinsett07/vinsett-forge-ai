# Forge production record — 2026-10-04

## Deployment

- Site: https://vinsett-forge-ai.netlify.app
- Netlify project: `76d970c3-c6e5-4fa9-a669-0bda1640ceb4`, `vinsett-forge-ai`.
- Academy uses a different project and was not changed.
- Validated runtime deployment: `6ac2e68e1ff6a207e3842eb5`.
- Application source commit: `2794a1ad3614f3c2ae3c795b06f99da20864cfc8`; [PR #2](https://github.com/Vinsett07/vinsett-forge-ai/pull/2).
- Managed PostgreSQL was provisioned by `@netlify/database`; all four migrations applied successfully. The following deploys reported no pending migrations.
- A fresh random session secret and version/provider/model configuration were saved and read back. Netlify supplies the database connection and AI Gateway credentials; no credentials were committed.
- Source was uploaded through Netlify's authenticated build service. The project is not yet linked to GitHub for automatic deploys.

## Acceptance evidence

[CI](https://github.com/Vinsett07/vinsett-forge-ai/actions/runs/37245106626) passed migrations twice against PostgreSQL 17, lint, typecheck, 19 unit tests, production build and 3 Chromium tests.

Production HTTP acceptance completed at `2026-10-04T23:57:52Z`:

| Check | Observed result |
| --- | --- |
| `/api/health` | 200; version 0.6.2; session and database checks pass |
| Registration/session | 201; Secure, HttpOnly, SameSite=Lax cookie |
| Project and delivery | Project, requirement and task created; task moved to done |
| GitHub | Public `Vinsett07/vinsett-forge-ai` linked and synchronized; 20 commits and 2 PRs retrieved |
| External AI | `openai` / `gpt-6-astra`; real provider response ID recorded |
| Human approval | Proposal remained pending; explicit approval created snapshot v2 |
| Duplicate approval | 409; proposal not reapplied |
| Logout/access | 401 for the protected project after logout |
| Login/persistence | Project, task and snapshot v2 available after login |
| Browser | Landing and auth pages render; full authenticated browser coverage passed in CI |

Machine-readable, credential-free evidence is in [the acceptance report](evidence/production-acceptance-2026-10-04.json). One external AI request was made; subsequent verification reused the recorded proposal.

## Backup rehearsal still required

Netlify reported on-publish database snapshots. This is evidence that a backup was taken, not evidence of successful restoration. The connected Netlify tools expose deployment/environment operations but no snapshot restore operation. The database dashboard currently requires browser sign-in.

The synthetic acceptance fixture is project `fe9cd4f4-ac99-4d4f-b18c-a0f37d49b5a3`, with a completed task, GitHub context, an approved AI proposal and snapshots v1/v2. It contains no real customer data. Use a new snapshot containing this fixture, restore into an isolated branch, verify all nine table counts plus the representative project and relationships, and confirm production is unchanged. Remove the fixture after the rehearsal.

The dashboard restore targets production; do not use it as a rehearsal over live data. The documented REST restore endpoint supports an explicit `branch_name`. Authenticate through an authorized Netlify management session before performing the isolated restore.

## Historical tags still required

The original commits and annotated tag objects are preserved in `history/recovered-v0.6.0.bundle`. Verification of all six tag-object and peeled-commit SHAs passed:

```bash
bash scripts/publish-historical-tags.sh --verify
```

Publishing is prepared as an atomic, non-forced operation:

```bash
bash scripts/publish-historical-tags.sh --push
```

This requires an authorized Git credential with repository write and workflow access. The current connector exposes branch updates but no tag creation, and the prior Actions token was explicitly rejected for missing workflow permission. The script never changes credentials or permissions and never rewrites existing refs.

## Deployment lessons

- Source uploads required an explicit `@netlify/plugin-nextjs` entry; framework detection alone initially deployed static build artifacts without dynamic routes. The corrected deployment includes the Next.js server handler.
- Environment upserts with unsupported scopes were reported as successful by the connector but were absent when read back. Standard project scopes persisted successfully and were verified through `/api/health`.

References: [Netlify Database API](https://docs.netlify.com/build/data-and-storage/netlify-database/api/), [backup and recovery](https://docs.netlify.com/build/data-and-storage/netlify-database/backup-and-recovery/), [AI Gateway](https://docs.netlify.com/build/ai-gateway/overview/).
