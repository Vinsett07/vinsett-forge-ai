import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { activityEvents, planSnapshots, requirements, tasks } from "@/src/db/schema";
import type { RequirementInput, TaskInput, TaskStatus } from "@/src/domain/delivery";
import { getProject } from "./projects";

export async function getDeliveryWorkspace(ownerId: string, projectId: string) {
  const project = await getProject(ownerId, projectId);
  if (!project) return null;

  const db = getDb();
  const [requirementRows, taskRows, activityRows, snapshotRows] = await Promise.all([
    db.select().from(requirements).where(eq(requirements.projectId, projectId)).orderBy(asc(requirements.createdAt)),
    db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(asc(tasks.status), asc(tasks.position), asc(tasks.createdAt)),
    db.select().from(activityEvents).where(eq(activityEvents.projectId, projectId)).orderBy(desc(activityEvents.createdAt)).limit(30),
    db.select({ version: planSnapshots.version }).from(planSnapshots).where(eq(planSnapshots.projectId, projectId)).orderBy(desc(planSnapshots.version)).limit(1),
  ]);

  return { project, requirements: requirementRows, tasks: taskRows, activity: activityRows, planVersion: snapshotRows[0]?.version ?? 1 };
}

export async function createRequirement(ownerId: string, projectId: string, actorUserId: string, input: RequirementInput) {
  if (!await getProject(ownerId, projectId)) return null;
  return getDb().transaction(async (tx) => {
    const rows = await tx.insert(requirements).values({ projectId, ...input }).returning();
    const requirement = rows[0];
    await tx.insert(activityEvents).values({
      projectId,
      actorUserId,
      type: "requirement.created",
      payload: { requirementId: requirement.id, title: requirement.title, priority: requirement.priority },
    });
    return requirement;
  });
}

export async function createTask(ownerId: string, projectId: string, actorUserId: string, input: TaskInput) {
  if (!await getProject(ownerId, projectId)) return null;
  const db = getDb();

  if (input.requirementId) {
    const linked = await db.select({ id: requirements.id }).from(requirements)
      .where(and(eq(requirements.id, input.requirementId), eq(requirements.projectId, projectId)))
      .limit(1);
    if (!linked[0]) throw new Error("requirement_not_found");
  }

  return db.transaction(async (tx) => {
    const rows = await tx.insert(tasks).values({ projectId, ...input }).returning();
    const task = rows[0];
    await tx.insert(activityEvents).values({
      projectId,
      actorUserId,
      type: "task.created",
      payload: { taskId: task.id, title: task.title, status: task.status },
    });
    return task;
  });
}

export async function moveTask(ownerId: string, projectId: string, taskId: string, actorUserId: string, status: TaskStatus) {
  if (!await getProject(ownerId, projectId)) return null;
  const db = getDb();
  const existing = await db.select().from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .limit(1);
  if (!existing[0]) return null;
  if (existing[0].status === status) return existing[0];

  return db.transaction(async (tx) => {
    const rows = await tx.update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
      .returning();
    const task = rows[0];
    await tx.insert(activityEvents).values({
      projectId,
      actorUserId,
      type: "task.status_changed",
      payload: { taskId, title: task.title, from: existing[0].status, to: status },
    });
    return task;
  });
}
