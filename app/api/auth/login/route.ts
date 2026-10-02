import { NextResponse } from "next/server";
import { verifyPassword } from "@/src/auth/password";
import { setSession } from "@/src/auth/session";
import { validateLogin } from "@/src/domain/auth";
import { findUserByEmail } from "@/src/repositories/users";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = validateLogin(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_login", details: parsed.errors }, { status: 400 });
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await setSession({ userId: user.id, email: user.email, displayName: user.displayName });
  return NextResponse.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
}
