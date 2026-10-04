import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionPayload = {
  userId: string;
  email: string;
  displayName: string;
  expiresAt: number;
};

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(
  input: Omit<SessionPayload, "expiresAt">,
  secret: string,
  ttlSeconds = 60 * 60 * 24 * 7,
): string {
  const payload: SessionPayload = {
    ...input,
    expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function readSessionToken(token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(decode(encoded)) as Partial<SessionPayload>;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.displayName !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= nowSeconds
    ) return null;

    return payload as SessionPayload;
  } catch {
    return null;
  }
}
