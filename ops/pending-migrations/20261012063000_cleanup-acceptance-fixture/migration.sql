-- Prepared cleanup, NOT an active Netlify migration. See ops/README.md.
-- Promote through a reviewed deploy only after confirming the production fixture.
-- Targets the synthetic acceptance project recorded in the 2026-10-05 restore audit.
DO $cleanup$
DECLARE
  fixture_id CONSTANT uuid := 'fe9cd4f4-ac99-4d4f-b18c-a0f37d49b5a3';
  evidence_cutoff CONSTANT timestamptz := '2026-10-05T16:29:26.620Z';
  fixture_owner uuid;
BEGIN
  -- Prevent writes between signature checks and cascades; readers remain available.
  -- Fail promptly on active writers instead of waiting indefinitely.
  PERFORM set_config('lock_timeout', '5s', true);
  LOCK TABLE public.users, public.projects, public.plan_snapshots,
    public.requirements, public.tasks, public.activity_events, public.ai_proposals,
    public.github_integrations, public.github_syncs IN SHARE ROW EXCLUSIVE MODE;

  SELECT owner_id INTO fixture_owner FROM public.projects WHERE id = fixture_id;
  IF NOT FOUND THEN
    RAISE NOTICE 'Acceptance fixture project is absent; no rows changed.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.projects p JOIN public.users u ON u.id = p.owner_id
    WHERE p.id = fixture_id AND p.name = 'Forge production acceptance'
      AND lower(u.email) ~ '^[^@]+@example[.]test$'
      AND p.created_at <= evidence_cutoff AND p.updated_at <= evidence_cutoff
      AND u.created_at <= evidence_cutoff AND u.updated_at <= evidence_cutoff
  ) THEN
    RAISE EXCEPTION 'Acceptance fixture identity changed; cleanup aborted.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.projects WHERE owner_id = fixture_owner AND id <> fixture_id)
    OR EXISTS (SELECT 1 FROM public.activity_events WHERE actor_user_id = fixture_owner AND project_id <> fixture_id)
    OR EXISTS (SELECT 1 FROM public.ai_proposals
      WHERE (created_by_user_id = fixture_owner OR decided_by_user_id = fixture_owner)
        AND project_id <> fixture_id)
    OR EXISTS (SELECT 1 FROM public.tasks t JOIN public.requirements r ON r.id = t.requirement_id
      WHERE (t.project_id = fixture_id) <> (r.project_id = fixture_id))
    OR EXISTS (SELECT 1 FROM public.github_syncs s JOIN public.github_integrations i ON i.id = s.integration_id
      WHERE (s.project_id = fixture_id) <> (i.project_id = fixture_id))
  THEN
    RAISE EXCEPTION 'Acceptance fixture has references outside its scope; cleanup aborted.';
  END IF;

  IF (SELECT count(*) FROM public.plan_snapshots WHERE project_id = fixture_id) <> 2
    OR (SELECT count(*) FROM public.plan_snapshots WHERE project_id = fixture_id AND version IN (1, 2)) <> 2
    OR (SELECT count(*) FROM public.requirements WHERE project_id = fixture_id) <> 4
    OR (SELECT count(*) FROM public.tasks WHERE project_id = fixture_id) <> 7
    OR (SELECT count(*) FROM public.activity_events WHERE project_id = fixture_id) <> 9
    OR (SELECT count(*) FROM public.ai_proposals WHERE project_id = fixture_id) <> 1
    OR (SELECT count(*) FROM public.github_integrations WHERE project_id = fixture_id) <> 1
    OR (SELECT count(*) FROM public.github_syncs WHERE project_id = fixture_id) <> 3
    OR NOT EXISTS (SELECT 1 FROM public.tasks WHERE project_id = fixture_id
      AND id = '0f64a49a-25ec-4411-810d-89bf4ee545d8' AND status = 'done')
    OR NOT EXISTS (SELECT 1 FROM public.ai_proposals WHERE project_id = fixture_id
      AND id = '3205f828-f4f9-429d-b05b-4f18b957efc0' AND status = 'approved'
      AND provider = 'openai' AND created_by_user_id = fixture_owner AND decided_by_user_id = fixture_owner)
    OR NOT EXISTS (SELECT 1 FROM public.github_integrations WHERE project_id = fixture_id
      AND repository_full_name = 'Vinsett07/vinsett-forge-ai' AND sync_status = 'ok')
    OR EXISTS (SELECT 1 FROM public.activity_events WHERE project_id = fixture_id AND actor_user_id <> fixture_owner)
  THEN
    RAISE EXCEPTION 'Acceptance fixture differs from recorded evidence; cleanup aborted.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM (
      SELECT created_at AS changed_at FROM public.plan_snapshots WHERE project_id = fixture_id
      UNION ALL SELECT greatest(created_at, updated_at) FROM public.requirements WHERE project_id = fixture_id
      UNION ALL SELECT greatest(created_at, updated_at) FROM public.tasks WHERE project_id = fixture_id
      UNION ALL SELECT created_at FROM public.activity_events WHERE project_id = fixture_id
      UNION ALL SELECT greatest(created_at, decided_at) FROM public.ai_proposals WHERE project_id = fixture_id
      UNION ALL SELECT greatest(created_at, updated_at, last_synced_at) FROM public.github_integrations WHERE project_id = fixture_id
      UNION ALL SELECT created_at FROM public.github_syncs WHERE project_id = fixture_id
    ) changes WHERE changed_at > evidence_cutoff
  ) THEN
    RAISE EXCEPTION 'Acceptance fixture has activity newer than the restore audit; cleanup aborted.';
  END IF;

  -- The checks above cover every cascade/SET NULL path out of these two rows.
  DELETE FROM public.projects WHERE id = fixture_id AND owner_id = fixture_owner;
  DELETE FROM public.users WHERE id = fixture_owner;
  RAISE NOTICE 'Recorded synthetic acceptance project and owner removed.';
END
$cleanup$;
