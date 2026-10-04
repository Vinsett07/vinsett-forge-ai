import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { activityEvents, planSnapshots, projects } from "@/src/db/schema";
import type { ProjectBrief, ProjectPlan } from "@/src/domain/project-plan";

export async function listProjects(ownerId: string) {
  return getDb().select().from(projects).where(eq(projects.ownerId, ownerId)).orderBy(desc(projects.updatedAt));
}

export async function getProject(ownerId: string, id: string) {
  const rows = await getDb().select().from(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProject(ownerId: string, brief: ProjectBrief, plan: ProjectPlan) {
  return getDb().transaction(async (tx) => {
    const created = await tx.insert(projects).values({ ownerId, ...brief, plan }).returning();
    const project = created[0];
    await tx.insert(planSnapshots).values({ projectId: project.id, version: 1, plan });
    await tx.insert(activityEvents).values({
      projectId: project.id,
      actorUserId: ownerId,
      type: "project.created",
      payload: { name: project.name, status: project.status },
    });
    return project;
  });
}

export async function updateProjectStatus(ownerId: string, id: string, status: "draft" | "active" | "paused" | "done") {
  const db = getDb();
  const existing = await getProject(ownerId, id);
  if (!existing) return null;
  if (existing.status === status) return existing;

  return db.transaction(async (tx) => {
    const rows = await tx.update(projects)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(projects.ownerId, ownerId), eq(projects.id, id)))
      .returning();
    const project = rows[0];
    await tx.insert(activityEvents).values({
      projectId: id,
      actorUserId: ownerId,
      type: "project.status_changed",
      payload: { name: project.name, from: existing.status, to: status },
    });
    return project;
  });
}

export async function deleteProject(ownerId: string, id: string) {
  const rows = await getDb().delete(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.id, id)))
    .returning({ id: projects.id });
  return rows[0] ?? null;
}
