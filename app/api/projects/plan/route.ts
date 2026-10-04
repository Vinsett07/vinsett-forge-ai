import { NextResponse } from "next/server";
import { buildDeterministicPlan, validateProjectBrief } from "@/src/domain/project-plan";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = validateProjectBrief(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_brief", details: parsed.errors },
      { status: 400 },
    );
  }

  // Milestone 1 intentionally uses a deterministic planner. The AI provider will
  // be added behind the same contract so tests remain stable and offline-safe.
  const plan = buildDeterministicPlan(parsed.data);
  return NextResponse.json({ plan }, { status: 200 });
}
