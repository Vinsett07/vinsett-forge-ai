import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { validateRequirement } from "@/src/domain/delivery";
import { createRequirement } from "@/src/repositories/delivery";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = validateRequirement(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_requirement", details: parsed.errors }, { status: 400 });
  const { id } = await context.params;
  const requirement = await createRequirement(session.userId, id, session.userId, parsed.data);
  return requirement
    ? NextResponse.json({ requirement }, { status: 201 })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}
