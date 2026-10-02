import test from "node:test";
import assert from "node:assert/strict";
import { consumeRateLimit, resetRateLimitsForTests } from "../src/security/rate-limit.ts";

test("rate limiter blocks after the configured budget and resets by window", () => {
  resetRateLimitsForTests();
  assert.equal(consumeRateLimit("a", { limit: 2, windowMs: 1000 }, 0).allowed, true);
  assert.equal(consumeRateLimit("a", { limit: 2, windowMs: 1000 }, 1).allowed, true);
  assert.equal(consumeRateLimit("a", { limit: 2, windowMs: 1000 }, 2).allowed, false);
  assert.equal(consumeRateLimit("a", { limit: 2, windowMs: 1000 }, 1001).allowed, true);
});
