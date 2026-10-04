import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { buildDeterministicPlan, validateProjectBrief } from "@/src/domain/project-plan";
import { createProject, listProjects } from "@/src/repositories/projects";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ projects: await listProjects(session.userId) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payload = await request.json().catch(() => null);
  const parsed = validateProjectBrief(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_brief", details: parsed.errors }, { status: 400 });
  }

  const plan = buildDeterministicPlan(parsed.data);
  const project = await createProject(session.userId, parsed.data, plan);
  return NextResponse.json({ project }, { status: 201 });
}
