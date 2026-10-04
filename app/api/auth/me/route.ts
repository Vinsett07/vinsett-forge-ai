import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";

export async function GET() {
  const session = await getSession();
  return session
    ? NextResponse.json({ user: session })
    : NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
