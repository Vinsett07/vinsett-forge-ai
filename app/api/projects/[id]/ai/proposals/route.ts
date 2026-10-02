import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { generateWorkspaceProposal } from "@/src/ai/provider";
import { getDeliveryWorkspace } from "@/src/repositories/delivery";
import { createAiProposalRecord, listAiProposals } from "@/src/repositories/ai-proposals";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const proposals = await listAiProposals(session.userId, id);
  return proposals ? NextResponse.json({ proposals }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function POST(_: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const workspace = await getDeliveryWorkspace(session.userId, id);
  if (!workspace) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const result = await generateWorkspaceProposal({
      name: workspace.project.name,
      problem: workspace.project.problem,
      audience: workspace.project.audience,
      outcome: workspace.project.outcome,
    }, {
      existingRequirements: workspace.requirements.map((item) => ({ title: item.title, description: item.description, priority: item.priority })),
      existingTasks: workspace.tasks.map((item) => ({ title: item.title, status: item.status })),
    });
    const proposal = await createAiProposalRecord(session.userId, id, session.userId, result);
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "ai_provider_failed", message: error instanceof Error ? error.message : "AI provider failed" }, { status: 502 });
  }
}
