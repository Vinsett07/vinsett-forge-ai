import assert from "node:assert/strict";
import test from "node:test";
import { validateLogin, validateRegistration } from "../src/domain/auth.ts";
import { hashPassword, verifyPassword } from "../src/auth/password.ts";
import { createSessionToken, readSessionToken } from "../src/auth/session-core.ts";

test("registration normalizes email and rejects weak input", () => {
  const valid = validateRegistration({ displayName: "Gustavo", email: "  GUSTAVO@EXAMPLE.COM ", password: "vinsett12345" });
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.email, "gustavo@example.com");

  const invalid = validateRegistration({ displayName: "G", email: "x", password: "123" });
  assert.equal(invalid.success, false);
});

test("login requires a syntactically valid email and password", () => {
  assert.equal(validateLogin({ email: "dev@example.com", password: "secret" }).success, true);
  assert.equal(validateLogin({ email: "dev", password: "" }).success, false);
});

test("password hashes are salted and verifiable", () => {
  const first = hashPassword("vinsett12345");
  const second = hashPassword("vinsett12345");
  assert.notEqual(first, second);
  assert.equal(verifyPassword("vinsett12345", first), true);
  assert.equal(verifyPassword("wrong-password", first), false);
});

test("session token detects tampering and expiration", () => {
  const secret = "a-secret-that-is-definitely-long-enough-for-testing";
  const token = createSessionToken({ userId: "u1", email: "dev@example.com", displayName: "Dev" }, secret, 60);
  const session = readSessionToken(token, secret);
  assert.equal(session?.userId, "u1");
  assert.equal(readSessionToken(`${token}x`, secret), null);
  assert.equal(readSessionToken(token, secret, Math.floor(Date.now() / 1000) + 120), null);
});
