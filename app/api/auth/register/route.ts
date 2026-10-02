import { NextResponse } from "next/server";
import { consumeRateLimit, requestIdentity } from "@/src/security/rate-limit";
import { hashPassword } from "@/src/auth/password";
import { setSession } from "@/src/auth/session";
import { validateRegistration } from "@/src/domain/auth";
import { createUser, findUserByEmail } from "@/src/repositories/users";

export async function POST(request: Request) {
  const rate = consumeRateLimit(`auth:${requestIdentity(request)}:register`, { limit: 6, windowMs: 3600000 });
  if (!rate.allowed) return NextResponse.json({ error: "rate_limited", resetAt: rate.resetAt }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } });
  const payload = await request.json().catch(() => null);
  const parsed = validateRegistration(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_registration", details: parsed.errors }, { status: 400 });
  }

  if (await findUserByEmail(parsed.data.email)) {
    return NextResponse.json({ error: "email_in_use" }, { status: 409 });
  }

  try {
    const user = await createUser({
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
    });
    await setSession({ userId: user.id, email: user.email, displayName: user.displayName });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return NextResponse.json({ error: "email_in_use" }, { status: 409 });
    }
    throw error;
  }
}
