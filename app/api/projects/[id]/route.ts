import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { deleteProject, getProject, updateProjectStatus } from "@/src/repositories/projects";

const statuses = new Set(["draft", "active", "paused", "done"]);

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const project = await getProject(session.userId, id);
  return project
    ? NextResponse.json({ project })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function PATCH(request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const payload = await request.json().catch(() => null) as { status?: unknown } | null;
  if (!payload || typeof payload.status !== "string" || !statuses.has(payload.status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  const { id } = await context.params;
  const project = await updateProjectStatus(
    session.userId,
    id,
    payload.status as "draft" | "active" | "paused" | "done",
  );
  return project
    ? NextResponse.json({ project })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function DELETE(_: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const deleted = await deleteProject(session.userId, id);
  return deleted
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}
