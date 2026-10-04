DO $$ BEGIN
  CREATE TYPE github_sync_status AS ENUM ('never', 'ok', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS github_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  repository_owner text NOT NULL,
  repository_name text NOT NULL,
  repository_full_name text NOT NULL,
  repository_url text NOT NULL,
  default_branch text NOT NULL,
  visibility text NOT NULL,
  sync_status github_sync_status NOT NULL DEFAULT 'never',
  last_error text,
  snapshot jsonb,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS github_integrations_project_unique ON github_integrations(project_id);

CREATE TABLE IF NOT EXISTS github_syncs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES github_integrations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status github_sync_status NOT NULL,
  snapshot jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS github_syncs_project_created_idx ON github_syncs(project_id, created_at DESC);
