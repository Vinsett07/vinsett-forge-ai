# Production Operations — Milestone 6

## Required environment

- `DATABASE_URL`
- `SESSION_SECRET` (32+ characters)
- `AI_PROVIDER` (`deterministic` or `openai`)
- `OPENAI_API_KEY` when OpenAI is enabled
- `OPENAI_MODEL`
- optional `GITHUB_TOKEN` for private repositories / higher GitHub API limits
- `APP_VERSION`

## Health

`GET /api/health` returns HTTP 200 only when runtime configuration and the database check are healthy; otherwise it returns HTTP 503 with per-check status.

## Abuse controls

The application includes process-local fixed-window guards for authentication, AI proposal generation and GitHub synchronization. These are defense-in-depth controls, not a distributed rate-limiting system. A multi-instance production deployment should add an edge or shared-store limiter.

## Security headers

Next.js responses set HSTS, clickjacking protection, MIME sniffing protection, a strict referrer policy, permissions restrictions and COOP.

## Database migration

Run:

```bash
npm run db:migrate
```

Migrations are ordered SQL files under `db/migrations`.

## Backup and restore

PostgreSQL backup:

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" > forge.backup
```

Restore into a disposable database first:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_DATABASE_URL" forge.backup
```

Validate `/api/health`, user/project counts and at least one representative project before promoting a restored database.

## Deployment

Netlify can deploy the Next.js App Router application from a Git provider. `netlify.toml` pins Node 22 and the production build command. Configure environment variables in the hosting provider rather than committing `.env` files.

The repository also includes a Dockerfile for providers that run containerized Node applications.
