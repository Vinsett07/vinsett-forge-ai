import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { activityEvents, githubIntegrations, githubSyncs } from "@/src/db/schema";
import { buildReleaseReadiness, parseGitHubRepositoryRef } from "@/src/domain/github";
import { fetchGitHubRepositorySnapshot } from "@/src/integrations/github/client";
import { getProject } from "./projects";

export async function getGitHubIntegration(ownerId: string, projectId: string) {
  if (!await getProject(ownerId, projectId)) return null;
  const rows = await getDb().select().from(githubIntegrations).where(eq(githubIntegrations.projectId, projectId)).limit(1);
  const integration = rows[0] ?? null;
  if (!integration) return { integration: null, readiness: [] };
  return { integration, readiness: integration.snapshot ? buildReleaseReadiness(integration.snapshot) : [] };
}

async function snapshotRepository(repository: string) {
  const ref = parseGitHubRepositoryRef(repository);
  const snapshot = await fetchGitHubRepositorySnapshot(ref, { token: process.env.GITHUB_TOKEN || undefined });
  return { ref, snapshot };
}

export async function linkGitHubRepository(ownerId: string, projectId: string, actorUserId: string, repository: string) {
  if (!await getProject(ownerId, projectId)) return null;
  const { ref, snapshot } = await snapshotRepository(repository);
  return getDb().transaction(async (tx) => {
    const existing = await tx.select().from(githubIntegrations).where(eq(githubIntegrations.projectId, projectId)).limit(1);
    const values = {
      repositoryOwner: ref.owner,
      repositoryName: ref.repo,
      repositoryFullName: snapshot.repository.fullName,
      repositoryUrl: snapshot.repository.htmlUrl,
      defaultBranch: snapshot.repository.defaultBranch,
      visibility: snapshot.repository.visibility,
      syncStatus: "ok" as const,
      lastError: null,
      snapshot,
      lastSyncedAt: new Date(snapshot.syncedAt),
      updatedAt: new Date(),
    };
    const rows = existing[0]
      ? await tx.update(githubIntegrations).set(values).where(eq(githubIntegrations.id, existing[0].id)).returning()
      : await tx.insert(githubIntegrations).values({ projectId, ...values }).returning();
    const integration = rows[0];
    await tx.insert(githubSyncs).values({ integrationId: integration.id, projectId, status: "ok", snapshot });
    await tx.insert(activityEvents).values({ projectId, actorUserId, type: "github.linked", payload: { repository: snapshot.repository.fullName, defaultBranch: snapshot.repository.defaultBranch } });
    return integration;
  });
}

export async function syncGitHubRepository(ownerId: string, projectId: string, actorUserId: string) {
  if (!await getProject(ownerId, projectId)) return null;
  const db = getDb();
  const rows = await db.select().from(githubIntegrations).where(eq(githubIntegrations.projectId, projectId)).limit(1);
  const integration = rows[0];
  if (!integration) return { state: "not_linked" as const };
  try {
    const { snapshot } = await snapshotRepository(integration.repositoryFullName);
    await db.transaction(async (tx) => {
      await tx.update(githubIntegrations).set({
        repositoryUrl: snapshot.repository.htmlUrl,
        defaultBranch: snapshot.repository.defaultBranch,
        visibility: snapshot.repository.visibility,
        syncStatus: "ok",
        lastError: null,
        snapshot,
        lastSyncedAt: new Date(snapshot.syncedAt),
        updatedAt: new Date(),
      }).where(eq(githubIntegrations.id, integration.id));
      await tx.insert(githubSyncs).values({ integrationId: integration.id, projectId, status: "ok", snapshot });
      await tx.insert(activityEvents).values({ projectId, actorUserId, type: "github.synced", payload: { repository: snapshot.repository.fullName, issues: snapshot.issues.length, pullRequests: snapshot.pullRequests.length, commits: snapshot.commits.length } });
    });
    return { state: "ok" as const, snapshot };
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : "github_sync_failed";
    await db.transaction(async (tx) => {
      await tx.update(githubIntegrations).set({ syncStatus: "error", lastError: error, updatedAt: new Date() }).where(eq(githubIntegrations.id, integration.id));
      await tx.insert(githubSyncs).values({ integrationId: integration.id, projectId, status: "error", error });
      await tx.insert(activityEvents).values({ projectId, actorUserId, type: "github.sync_failed", payload: { repository: integration.repositoryFullName, error } });
    });
    return { state: "error" as const, error };
  }
}

export async function unlinkGitHubRepository(ownerId: string, projectId: string, actorUserId: string) {
  if (!await getProject(ownerId, projectId)) return null;
  const db = getDb();
  const existing = await db.select().from(githubIntegrations).where(eq(githubIntegrations.projectId, projectId)).limit(1);
  if (!existing[0]) return { state: "not_linked" as const };
  await db.transaction(async (tx) => {
    await tx.delete(githubIntegrations).where(and(eq(githubIntegrations.projectId, projectId), eq(githubIntegrations.id, existing[0].id)));
    await tx.insert(activityEvents).values({ projectId, actorUserId, type: "github.unlinked", payload: { repository: existing[0].repositoryFullName } });
  });
  return { state: "unlinked" as const };
}

export async function listGitHubSyncs(ownerId: string, projectId: string) {
  if (!await getProject(ownerId, projectId)) return null;
  return getDb().select().from(githubSyncs).where(eq(githubSyncs.projectId, projectId)).orderBy(desc(githubSyncs.createdAt)).limit(10);
}
