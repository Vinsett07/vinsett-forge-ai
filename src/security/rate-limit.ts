type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number };

export function consumeRateLimit(key: string, options: { limit: number; windowMs: number }, now = Date.now()): RateLimitResult {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + options.windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: Math.max(0, options.limit - 1), resetAt: next.resetAt };
  }
  if (current.count >= options.limit) return { allowed: false, remaining: 0, resetAt: current.resetAt };
  current.count += 1;
  return { allowed: true, remaining: Math.max(0, options.limit - current.count), resetAt: current.resetAt };
}

export function requestIdentity(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function resetRateLimitsForTests() { buckets.clear(); }
