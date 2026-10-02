DO $$ BEGIN
  CREATE TYPE ai_proposal_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS ai_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'workspace_bootstrap',
  status ai_proposal_status NOT NULL DEFAULT 'pending',
  prompt_version text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  provider_response_id text,
  proposal jsonb NOT NULL,
  decided_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_proposals_project_created_idx
  ON ai_proposals(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_proposals_pending_idx
  ON ai_proposals(project_id, status)
  WHERE status = 'pending';
