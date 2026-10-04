import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { decideAiProposal } from "@/src/repositories/ai-proposals";

type Context = { params: Promise<{ id: string; proposalId: string }> };

export async function PATCH(request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { decision?: unknown } | null;
  if (body?.decision !== "approve" && body?.decision !== "reject") {
    return NextResponse.json({ error: "invalid_decision" }, { status: 400 });
  }
  const { id, proposalId } = await context.params;
  const result = await decideAiProposal(session.userId, id, proposalId, session.userId, body.decision);
  if (result.state === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.state === "already_decided_or_missing") return NextResponse.json({ error: "already_decided_or_missing" }, { status: 409 });
  return NextResponse.json(result);
}
