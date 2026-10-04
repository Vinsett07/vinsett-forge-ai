import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { validateTaskStatus } from "@/src/domain/delivery";
import { moveTask } from "@/src/repositories/delivery";

type Context = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { status?: unknown } | null;
  const status = validateTaskStatus(body?.status);
  if (!status) return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  const { id, taskId } = await context.params;
  const task = await moveTask(session.userId, id, taskId, session.userId, status);
  return task
    ? NextResponse.json({ task })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}
