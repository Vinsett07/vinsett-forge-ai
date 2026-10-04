import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/src/security/rate-limit";
import { requireApiSession } from "@/src/auth/session";
import { syncGitHubRepository } from "@/src/repositories/github-integrations";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const rate = consumeRateLimit(`github-sync:${session.userId}:${id}`, { limit: 30, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) return NextResponse.json({ error: "rate_limited", resetAt: rate.resetAt }, { status: 429 });
  const result = await syncGitHubRepository(session.userId, id, session.userId);
  if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const status = result.state === "error" ? 502 : result.state === "not_linked" ? 409 : 200;
  return NextResponse.json(result, { status });
}
