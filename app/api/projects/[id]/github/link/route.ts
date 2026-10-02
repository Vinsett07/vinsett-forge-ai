import { NextResponse } from "next/server";
import { requireApiSession } from "@/src/auth/session";
import { linkGitHubRepository, unlinkGitHubRepository } from "@/src/repositories/github-integrations";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  try {
    const integration = await linkGitHubRepository(session.userId, id, session.userId, body.repository);
    if (!integration) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ integration }, { status: 201 });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "github_link_failed";
    const status = message === "invalid_repository" ? 400 : message === "github_404" ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const result = await unlinkGitHubRepository(session.userId, id, session.userId);
  if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(result);
}
