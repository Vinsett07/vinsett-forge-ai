import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import postgres from "postgres";

const fixtureId = "fe9cd4f4-ac99-4d4f-b18c-a0f37d49b5a3";
const fixtureTaskId = "0f64a49a-25ec-4411-810d-89bf4ee545d8";
const fixtureProposalId = "3205f828-f4f9-429d-b05b-4f18b957efc0";
const recordedAt = "2026-10-04T23:00:00Z";
const tables = ["users", "projects", "plan_snapshots", "requirements", "tasks",
  "activity_events", "ai_proposals", "github_integrations", "github_syncs"];

function disposableDatabaseUrl(): string | undefined {
  const candidate = process.env.FORGE_CLEANUP_TEST_DATABASE_URL
    ?? (process.env.CI === "true" && process.env.APP_VERSION === "ci" ? process.env.DATABASE_URL : undefined);
  if (!candidate) return undefined;
  let url: URL;
  try { url = new URL(candidate); } catch { throw new Error("Invalid disposable database URL"); }
  if (!["postgres:", "postgresql:"].includes(url.protocol)
    || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("Cleanup tests require an explicitly disposable loopback PostgreSQL database");
  }
  return candidate;
}

type Tx = postgres.TransactionSql;

async function fingerprint(tx: Tx) {
  const result: Record<string, string> = {};
  for (const table of tables) {
    // Table identifiers are constants owned by this test, never external input.
    const [row] = await tx.unsafe(`SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text, '[]')) AS digest FROM public.${table} t`);
    result[table] = row.digest;
  }
  return result;
}

async function seed(tx: Tx, projectId: string) {
  const ownerId = randomUUID();
  const requirementId = randomUUID();
  const integrationId = randomUUID();
  const taskId = projectId === fixtureId ? fixtureTaskId : randomUUID();
  const proposalId = projectId === fixtureId ? fixtureProposalId : randomUUID();
  const email = `cleanup-test-${ownerId}@example.test`;
  await tx`INSERT INTO public.users (id, display_name, email, password_hash, created_at, updated_at)
    VALUES (${ownerId}, 'Disposable fixture', ${email}, 'not-a-login-password-hash', ${recordedAt}, ${recordedAt})`;
  await tx`INSERT INTO public.projects (id, owner_id, name, problem, audience, outcome, created_at, updated_at)
    VALUES (${projectId}, ${ownerId}, 'Forge production acceptance', 'Disposable test problem',
      'Test audience', 'Test outcome', ${recordedAt}, ${recordedAt})`;
  await tx`INSERT INTO public.plan_snapshots (project_id, version, plan, created_at)
    SELECT ${projectId}, n, '{}'::jsonb, ${recordedAt} FROM generate_series(1, 2) n`;
  await tx`INSERT INTO public.requirements (id, project_id, title, description, acceptance_criteria, created_at, updated_at)
    VALUES (${requirementId}, ${projectId}, 'Primary requirement', 'Test', '[]', ${recordedAt}, ${recordedAt})`;
  await tx`INSERT INTO public.requirements (project_id, title, description, acceptance_criteria, created_at, updated_at)
    SELECT ${projectId}, 'Other requirement', 'Test', '[]'::jsonb, ${recordedAt}, ${recordedAt} FROM generate_series(1, 3)`;
  await tx`INSERT INTO public.tasks (id, project_id, requirement_id, title, status, created_at, updated_at)
    VALUES (${taskId}, ${projectId}, ${requirementId}, 'Completed task', 'done', ${recordedAt}, ${recordedAt})`;
  await tx`INSERT INTO public.tasks (project_id, title, created_at, updated_at)
    SELECT ${projectId}, 'Other task', ${recordedAt}, ${recordedAt} FROM generate_series(1, 6)`;
  await tx`INSERT INTO public.activity_events (project_id, actor_user_id, type, payload, created_at)
    SELECT ${projectId}, ${ownerId}, 'test.event', '{}'::jsonb, ${recordedAt} FROM generate_series(1, 9)`;
  await tx`INSERT INTO public.ai_proposals (id, project_id, created_by_user_id, decided_by_user_id,
      status, prompt_version, provider, model, proposal, decided_at, created_at)
    VALUES (${proposalId}, ${projectId}, ${ownerId}, ${ownerId}, 'approved', 'test', 'openai',
      'test-model', '{}'::jsonb, ${recordedAt}, ${recordedAt})`;
  await tx`INSERT INTO public.github_integrations (id, project_id, repository_owner, repository_name,
      repository_full_name, repository_url, default_branch, visibility, sync_status, created_at, updated_at)
    VALUES (${integrationId}, ${projectId}, 'Vinsett07', 'vinsett-forge-ai', 'Vinsett07/vinsett-forge-ai',
      'https://github.com/Vinsett07/vinsett-forge-ai', 'main', 'public', 'ok', ${recordedAt}, ${recordedAt})`;
  await tx`INSERT INTO public.github_syncs (integration_id, project_id, status, created_at)
    SELECT ${integrationId}, ${projectId}, 'ok'::github_sync_status, ${recordedAt} FROM generate_series(1, 3)`;
  return { projectId, ownerId, requirementId, integrationId, taskId, proposalId };
}

test("production acceptance cleanup protects unrelated and changed data", {
  skip: disposableDatabaseUrl() ? false : "Requires disposable PostgreSQL; automatically enabled in repository CI",
}, async (t) => {
  const client = postgres(disposableDatabaseUrl()!, { max: 1, onnotice: () => {} });
  t.after(() => client.end());
  const cleanup = await readFile(new URL(
    "../ops/pending-migrations/20261012063000_cleanup-acceptance-fixture/migration.sql", import.meta.url), "utf8");

  async function rollbackTest(run: (tx: Tx) => Promise<void>) {
    const rollback = new Error("intentional test rollback");
    try {
      await client.begin(async (tx) => { await run(tx); throw rollback; });
    } catch (error) {
      if (error !== rollback) throw error;
    }
  }

  async function rejectsWithoutChanges(tx: Tx, expected: RegExp) {
    const before = await fingerprint(tx);
    await assert.rejects(tx.savepoint((savepoint) => savepoint.unsafe(cleanup)), expected);
    assert.deepEqual(await fingerprint(tx), before);
  }

  await t.test("removes only the recorded graph and owner; reapplication is harmless", () => rollbackTest(async (tx) => {
    await seed(tx, randomUUID());
    const unrelated = await fingerprint(tx);
    const fixture = await seed(tx, fixtureId);
    await tx.unsafe(cleanup);
    assert.equal((await tx`SELECT id FROM public.projects WHERE id = ${fixtureId}`).length, 0);
    assert.equal((await tx`SELECT id FROM public.users WHERE id = ${fixture.ownerId}`).length, 0);
    assert.deepEqual(await fingerprint(tx), unrelated);
    await tx.unsafe(cleanup);
    assert.deepEqual(await fingerprint(tx), unrelated);
  }));

  await t.test("absent target leaves even similarly named synthetic projects intact", () => rollbackTest(async (tx) => {
    await seed(tx, randomUUID());
    const before = await fingerprint(tx);
    await tx.unsafe(cleanup);
    assert.deepEqual(await fingerprint(tx), before);
  }));

  await t.test("non-test owner is never deleted", () => rollbackTest(async (tx) => {
    const fixture = await seed(tx, fixtureId);
    await tx`UPDATE public.users SET email = 'ordinary-owner@example.com' WHERE id = ${fixture.ownerId}`;
    await rejectsWithoutChanges(tx, /identity changed/);
  }));

  await t.test("new work after the audit blocks deletion", () => rollbackTest(async (tx) => {
    await seed(tx, fixtureId);
    await tx`UPDATE public.tasks SET title = 'New user work', updated_at = now() WHERE id = ${fixtureTaskId}`;
    await rejectsWithoutChanges(tx, /activity newer/);
  }));

  await t.test("additional scope blocks deletion even with an old timestamp", () => rollbackTest(async (tx) => {
    await seed(tx, fixtureId);
    await tx`INSERT INTO public.tasks (project_id, title, created_at, updated_at)
      VALUES (${fixtureId}, 'Unrecorded task', ${recordedAt}, ${recordedAt})`;
    await rejectsWithoutChanges(tx, /differs from recorded evidence/);
  }));

  await t.test("another project belonging to the owner blocks cascading account deletion", () => rollbackTest(async (tx) => {
    const fixture = await seed(tx, fixtureId);
    const other = await seed(tx, randomUUID());
    await tx`UPDATE public.projects SET owner_id = ${fixture.ownerId} WHERE id = ${other.projectId}`;
    await rejectsWithoutChanges(tx, /references outside/);
  }));

  for (const relation of ["task requirement", "GitHub integration", "activity actor", "AI creator", "AI decider"]) {
    await t.test(`external ${relation} reference is preserved by aborting`, () => rollbackTest(async (tx) => {
      const fixture = await seed(tx, fixtureId);
      const other = await seed(tx, randomUUID());
      if (relation === "task requirement") {
        await tx`UPDATE public.tasks SET requirement_id = ${fixture.requirementId} WHERE id = ${other.taskId}`;
      } else if (relation === "GitHub integration") {
        await tx`UPDATE public.github_syncs SET integration_id = ${fixture.integrationId} WHERE project_id = ${other.projectId}`;
      } else if (relation === "activity actor") {
        await tx`UPDATE public.activity_events SET actor_user_id = ${fixture.ownerId} WHERE project_id = ${other.projectId}`;
      } else if (relation === "AI creator") {
        await tx`UPDATE public.ai_proposals SET created_by_user_id = ${fixture.ownerId} WHERE id = ${other.proposalId}`;
      } else {
        await tx`UPDATE public.ai_proposals SET decided_by_user_id = ${fixture.ownerId} WHERE id = ${other.proposalId}`;
      }
      await rejectsWithoutChanges(tx, /references outside/);
    }));
  }
});
