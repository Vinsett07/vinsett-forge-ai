# Production Operations — v0.6.2

## Required environment

- `DATABASE_URL` for local/CI or a self-managed database. On Netlify, `@netlify/database` supplies the managed connection automatically; do not override it.
- `SESSION_SECRET` (32+ characters)
- `AI_PROVIDER` (`deterministic` or `openai`)
- `OPENAI_API_KEY` when OpenAI is enabled. Netlify AI Gateway injects a server-side key and `OPENAI_BASE_URL` automatically on production deploys. Do not add a personal key when using the gateway.
- `OPENAI_MODEL`
- optional `GITHUB_TOKEN` for a trusted private installation / higher GitHub API limits. The public Forge site uses anonymous access to public repositories; a shared token must not grant every registered user access to private repositories.
- `APP_VERSION`

## Health

`GET /api/health` returns HTTP 200 only when the session secret, database connection and all nine application tables are available; otherwise it returns HTTP 503 with per-check status. It does not disclose credentials.

## Abuse controls

The application includes process-local fixed-window guards for authentication, AI proposal generation and GitHub synchronization. These are defense-in-depth controls, not a distributed rate-limiting system. A multi-instance production deployment should add an edge or shared-store limiter.

## Security headers

Next.js responses set HSTS, clickjacking protection, MIME sniffing protection, a strict referrer policy, permissions restrictions and COOP.

## Database migration

Run:

```bash
npm run db:migrate
```

The canonical SQL migrations are under `netlify/database/migrations/<number>_<slug>/migration.sql`. Netlify applies them before publishing a production deploy and blocks publication if a migration fails. The local/CI runner uses the same files with an explicit `DATABASE_URL` and deliberately reapplies them to check idempotence.

## Backup and restore

Netlify Database automatically takes daily backups and a backup when publishing production. Manage snapshots in the Forge project's Database dashboard. A restore rehearsal must target an isolated database branch. Check the current OpenAPI schema for the explicit target parameter: the version used on 2026-10-05 specifies `branch_id`, while the prose documentation still mentions `branch_name`. Never omit the target or restore over production for a rehearsal.

The [2026-10-05 rehearsal](BACKUP_RESTORE_2026-10-05.md) passed full table/schema comparison, a restoration probe and all 13 relationship checks. Netlify preserved the pre-restore test state as a second branch. The tested management API requires the dashboard to delete these branches, and its production connection was read-only. Cleanup remains recorded in the rehearsal report; do not assume a requested owner role grants production write access.

For a PostgreSQL logical backup with an authorized connection string:

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" > forge.backup
```

Restore into a disposable database first:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_DATABASE_URL" forge.backup
```

Validate `/api/health`, user/project counts and at least one representative project before promoting a restored database.

## Deployment

The Forge project is `vinsett-forge-ai` (`76d970c3-c6e5-4fa9-a669-0bda1640ceb4`), separate from Academy. `netlify.toml` pins Node 22, the production build command and `.next` output, and explicitly enables the Next.js adapter for uploads. Configure secrets in project environment variables rather than committing `.env` files. This Free-plan project uses the standard environment scopes; no secret is prefixed with `NEXT_PUBLIC_`. Always read back configuration and validate the runtime: the connector can report a successful upsert even when an unsupported scope was not saved. Installing `@netlify/database` enables managed database provisioning during deployment.

Production configuration: `SESSION_SECRET` (random, 32+ characters), `AI_PROVIDER=openai`, `OPENAI_MODEL=gpt-6-astra`, `APP_VERSION=0.6.2`. The gateway key, base URL and database connection are supplied by Netlify. Validate a real proposal's `provider`, `model` and response ID; a deterministic fallback does not validate external AI.

The repository also includes a Dockerfile for providers that run containerized Node applications.
