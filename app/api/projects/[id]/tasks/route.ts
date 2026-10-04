import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { validateTask } from "@/src/domain/delivery";
import { createTask } from "@/src/repositories/delivery";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = validateTask(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_task", details: parsed.errors }, { status: 400 });
  const { id } = await context.params;
  try {
    const task = await createTask(session.userId, id, session.userId, parsed.data);
    return task
      ? NextResponse.json({ task }, { status: 201 })
      : NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch (error) {
    if (error instanceof Error && error.message === "requirement_not_found") {
      return NextResponse.json({ error: "requirement_not_found" }, { status: 400 });
    }
    throw error;
  }
}
