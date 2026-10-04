import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const checks: Record<string, { ok: boolean; detail?: string }> = {
    runtime: { ok: true },
    sessionSecret: { ok: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32), detail: "SESSION_SECRET >= 32 chars" },
    databaseUrl: { ok: Boolean(process.env.DATABASE_URL), detail: "DATABASE_URL configured" },
  };
  if (checks.databaseUrl.ok) {
    try {
      await getDb().execute(sql`select 1`);
      checks.database = { ok: true };
    } catch {
      checks.database = { ok: false, detail: "database query failed" };
    }
  } else checks.database = { ok: false, detail: "database not configured" };

  const ok = Object.values(checks).every((item) => item.ok);
  return NextResponse.json({ status: ok ? "ok" : "degraded", version: process.env.APP_VERSION ?? "dev", checks, latencyMs: Date.now() - started }, { status: ok ? 200 : 503 });
}
