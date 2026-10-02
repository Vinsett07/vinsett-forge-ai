import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, readSessionToken, type SessionPayload } from "./session-core";

export const SESSION_COOKIE = "vinsett_forge_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production.");
  }
  return "vinsett-forge-development-session-secret-change-me";
}

export async function setSession(input: Omit<SessionPayload, "expiresAt">): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(input, sessionSecret(), SESSION_TTL_SECONDS), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? readSessionToken(token, sessionSecret()) : null;
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/auth");
  return session;
}
