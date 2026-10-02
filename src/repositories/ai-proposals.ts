import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { activityEvents, aiProposals, planSnapshots, projects, requirements, tasks } from "@/src/db/schema";
import type { PlannerResult } from "@/src/ai/provider";
import { getProject } from "./projects";

export async function listAiProposals(ownerId: string, projectId: string) {
  if (!await getProject(ownerId, projectId)) return null;
  return getDb().select().from(aiProposals)
    .where(eq(aiProposals.projectId, projectId))
    .orderBy(desc(aiProposals.createdAt))
    .limit(10);
}

export async function createAiProposalRecord(ownerId: string, projectId: string, actorUserId: string, result: PlannerResult) {
  if (!await getProject(ownerId, projectId)) return null;
  return getDb().transaction(async (tx) => {
    const rows = await tx.insert(aiProposals).values({
      projectId,
      createdByUserId: actorUserId,
      promptVersion: result.promptVersion,
      provider: result.provider,
      model: result.model,
      providerResponseId: result.providerResponseId,
      proposal: result.proposal,
    }).returning();
    const proposal = rows[0];
    await tx.insert(activityEvents).values({
      projectId,
      actorUserId,
      type: "ai.proposal_created",
      payload: { proposalId: proposal.id, provider: proposal.provider, model: proposal.model, promptVersion: proposal.promptVersion },
    });
    return proposal;
  });
}

export async function decideAiProposal(
  ownerId: string,
  projectId: string,
  proposalId: string,
  actorUserId: string,
  decision: "approve" | "reject",
) {
  if (!await getProject(ownerId, projectId)) return { state: "not_found" as const };
  const db = getDb();

  return db.transaction(async (tx) => {
    const proposalRows = await tx.update(aiProposals)
      .set({
        status: decision === "approve" ? "approved" : "rejected",
        decidedByUserId: actorUserId,
        decidedAt: new Date(),
      })
      .where(and(
        eq(aiProposals.id, proposalId),
        eq(aiProposals.projectId, projectId),
        eq(aiProposals.status, "pending"),
      ))
      .returning();

    const record = proposalRows[0];
    if (!record) return { state: "already_decided_or_missing" as const };

    if (decision === "reject") {
      await tx.insert(activityEvents).values({
        projectId,
        actorUserId,
        type: "ai.proposal_rejected",
        payload: { proposalId },
      });
      return { state: "rejected" as const, proposal: record };
    }

    const previousSnapshots = await tx.select({ version: planSnapshots.version }).from(planSnapshots)
      .where(eq(planSnapshots.projectId, projectId))
      .orderBy(desc(planSnapshots.version))
      .limit(1);
    const version = (previousSnapshots[0]?.version ?? 0) + 1;

    await tx.update(projects)
      .set({ plan: record.proposal.plan, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)));
    await tx.insert(planSnapshots).values({ projectId, version, plan: record.proposal.plan });

    const requirementIdByKey = new Map<string, string>();
    for (const item of record.proposal.requirements) {
      const inserted = await tx.insert(requirements).values({
        projectId,
        title: item.title,
        description: item.description,
        acceptanceCriteria: item.acceptanceCriteria,
        priority: item.priority,
      }).returning({ id: requirements.id });
      requirementIdByKey.set(item.key, inserted[0].id);
    }

    for (const item of record.proposal.tasks) {
      await tx.insert(tasks).values({
        projectId,
        requirementId: item.requirementKey ? requirementIdByKey.get(item.requirementKey) ?? null : null,
        title: item.title,
        description: item.description,
        status: "backlog",
      });
    }

    await tx.insert(activityEvents).values({
      projectId,
      actorUserId,
      type: "ai.proposal_approved",
      payload: {
        proposalId,
        snapshotVersion: version,
        requirementsAdded: record.proposal.requirements.length,
        tasksAdded: record.proposal.tasks.length,
      },
    });

    return { state: "approved" as const, proposal: record, snapshotVersion: version };
  });
}
