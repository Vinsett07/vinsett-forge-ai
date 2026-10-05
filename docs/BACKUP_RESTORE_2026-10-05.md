# Backup restoration verification — 2026-10-05

The existing production backup was restored successfully into an isolated database branch. Its structure and all nine application tables match production. Historical tag publication and cleanup remain pending the access requirements below.

## Scope and source

- Project: `vinsett-forge-ai`, Netlify site `76d970c3-c6e5-4fa9-a669-0bda1640ceb4`.
- Production: https://vinsett-forge-ai.netlify.app, v0.6.2. Academy was not accessed or changed.
- Existing on-publish backup: `snap-fancy-voice-b5tu3x8l`, created `2026-10-05T00:02:34Z`.
- Restoration target: `restore-rehearsal-20261005`; its database endpoint was checked to differ from production before any test writes.
- Netlify CLI authorization was completed. Production was inspected with a read-only database connection.
- All timestamps in the evidence are UTC.

## What was verified

The test branch initially copied production. To distinguish an actual restore from a successful clone, a `restore_rehearsal_marker` table was added only to the test branch and the synthetic acceptance task was changed from `done` to `backlog` there.

The snapshot restore API returned HTTP 200 with an explicit test target. After restoration, the marker table was absent and the task was back to `done`. Netlify also retained the pre-restore test state in `old-restore-rehearsal-20261005`.

Read-only audits compared original production, the restored branch and production after restoration:

| Table | Verified rows |
| --- | ---: |
| users | 1 |
| projects | 1 |
| plan_snapshots | 2 |
| requirements | 4 |
| tasks | 7 |
| activity_events | 9 |
| ai_proposals | 1 |
| github_integrations | 1 |
| github_syncs | 3 |

All nine table counts and whole-table fingerprints matched. Schema fingerprints also matched, covering 78 columns, constraints, indexes and enums. All 13 foreign keys were validated; no orphan records or unvalidated constraints were found.

The representative project retained its owner, completed task, plan versions 1 and 2, approved external AI proposal, four requirements, nine activity events and three successful GitHub syncs. Production's data and schema remained unchanged. The health endpoint subsequently returned HTTP 200 with all checks passing.

The [machine-readable evidence](evidence/backup-restore-2026-10-05.json) contains only counts, fingerprints, test identifiers and operational results. It includes no credentials, emails, password hashes or raw database rows.

## Cleanup still requires dashboard access

The authenticated DELETE request for the temporary branch returned HTTP 401: `This operation must be performed from the Netlify dashboard.` No database branch was deleted, and the dashboard requires a separate sign-in in the working browser.

The two disposable branches remaining in the Forge project's Database area are:

- `restore-rehearsal-20261005` — verified restored data.
- `old-restore-rehearsal-20261005` — Netlify's preserved pre-restore test state.

Keep `production` and both existing snapshots. Delete only the two named test branches through the authenticated dashboard after review.

The synthetic acceptance account/project also remains in production. An owner-role connection request returned `netlifydb_readonly`; deletion of the synthetic user was denied. No permission changes were attempted, and a subsequent audit confirmed production contents were intact. Cleanup must use an appropriately authorized connection and target only fixture project `fe9cd4f4-ac99-4d4f-b18c-a0f37d49b5a3` and its synthetic `@example.test` owner.

## Historical tags still pending

All six original annotated tag objects and peeled commits passed `bash scripts/publish-historical-tags.sh --verify`. The remote tag namespace was checked and remains empty.

The user approved GitHub authorization, but the CLI login was interrupted by an execution-environment network-policy block for `api.github.com`. A request to permit an escalated connectivity check was rejected by the environment's approval policy. No GitHub CLI credential was saved and no tag push was attempted in this session.

The existing publication script is ready for an authorized Git client with repository write and workflow access:

```bash
bash scripts/publish-historical-tags.sh --push
```

It preserves the original annotated objects and publishes them atomically without force. Replacement lightweight tags and changes to historical workflow files are not part of the recovery.

## API detail for future rehearsals

The OpenAPI schema shipped with Netlify CLI 27.11.0 identifies branches using `branch_id`; the documentation page still describes `branch_name` for restoration. This rehearsal submitted both keys with the same explicit non-production target. Never omit the target. Read back the branch connection after restoring because Netlify preserves the previous branch separately.

References: [Netlify Database API](https://docs.netlify.com/build/data-and-storage/netlify-database/api/), [Netlify OpenAPI schema](https://open-api.netlify.com/).
