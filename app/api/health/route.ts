import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { connectionString, getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const checks: Record<string, { ok: boolean; detail?: string }> = {
    runtime: { ok: true },
    sessionSecret: { ok: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32), detail: "SESSION_SECRET >= 32 chars" },
  };
  try {
    connectionString();
    checks.databaseUrl = { ok: true, detail: "database connection configured" };
    try {
      // Verify the complete application schema, not just network connectivity.
      await getDb().execute(sql`select 1 from users, projects, plan_snapshots,
        requirements, tasks, activity_events, ai_proposals,
        github_integrations, github_syncs limit 0`);
      checks.database = { ok: true };
    } catch {
      checks.database = { ok: false, detail: "database schema query failed" };
    }
  } catch {
    checks.databaseUrl = { ok: false, detail: "database not configured" };
    checks.database = { ok: false };
  }

  const ok = Object.values(checks).every((item) => item.ok);
  return NextResponse.json({ status: ok ? "ok" : "degraded", version: process.env.APP_VERSION ?? "dev", checks, latencyMs: Date.now() - started }, { status: ok ? 200 : 503 });
}
