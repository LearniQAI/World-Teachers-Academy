// Run: node --experimental-strip-types --test tests/unit/*.test.ts
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { signAccessToken, readAccessToken, accessDays, hashOtp, otpMatches, legacyHashOtp } from "../../lib/portal-access.ts";
import { sourceAccess, hiddenSources } from "../../lib/source-access.ts";

const LEAD = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";
const SID = "9b1d2c3e-0000-4000-8000-000000000001";
beforeEach(() => {
  process.env.PORTAL_ACCESS_SECRET = "test-secret-that-is-long-enough-0123456789";
  delete process.env.PORTAL_ACCESS_DAYS;
  delete process.env.PORTAL_ACCESS_NOT_BEFORE;
  delete process.env.JOB_SOURCE_ACCESS_ADZUNA;
});

test("a fresh token is accepted and lasts 90 days by default", () => {
  const now = new Date("2026-11-12T10:00:00Z");
  const t = signAccessToken(LEAD, SID, now)!;
  assert.equal(readAccessToken(t.token, now)?.lid, LEAD);
  assert.equal(t.expires.toISOString(), "2027-02-10T10:00:00.000Z");
  assert.ok(readAccessToken(t.token, new Date("2027-02-09T10:00:00Z")), "still valid on day 89");
  assert.equal(readAccessToken(t.token, new Date("2027-02-10T10:00:01Z")), null, "expired after 90 days");
});
test("the cookie holds no name or email", () => {
  const t = signAccessToken(LEAD, SID)!;
  const body = JSON.parse(Buffer.from(t.token.split(".")[0], "base64url").toString());
  assert.deepEqual(Object.keys(body).sort(), ["exp", "iat", "lid", "sid", "v"]);
});
test("tampered, forged or malformed tokens are refused", () => {
  const t = signAccessToken(LEAD, SID)!.token;
  const [body, sig] = t.split(".");
  const other = Buffer.from(JSON.stringify({ v: 1, lid: "someone-else", iat: 1, exp: 9_999_999_999 })).toString("base64url");
  assert.equal(readAccessToken(`${other}.${sig}`), null, "changed payload");
  assert.equal(readAccessToken(`${body}.${sig.slice(0, -2)}AA`), null, "changed signature");
  assert.equal(readAccessToken(`${body}`), null);
  assert.equal(readAccessToken(`${t}.extra`), null);
  assert.equal(readAccessToken("x".repeat(600)), null);
  assert.equal(readAccessToken(""), null);
  process.env.PORTAL_ACCESS_SECRET = "a-different-secret-that-is-long-enough-xyz";
  assert.equal(readAccessToken(t), null, "rotating the secret revokes every token");
});
test("fails closed without a proper secret", () => {
  process.env.PORTAL_ACCESS_SECRET = "short";
  assert.equal(signAccessToken(LEAD, SID), null);
  delete process.env.PORTAL_ACCESS_SECRET;
  assert.equal(signAccessToken(LEAD, SID), null);
});
test("PORTAL_ACCESS_NOT_BEFORE revokes earlier tokens only", () => {
  const old = signAccessToken(LEAD, SID, new Date(Date.now() - 86_400_000))!.token;
  process.env.PORTAL_ACCESS_NOT_BEFORE = new Date(Date.now() - 3_600_000).toISOString();
  assert.equal(readAccessToken(old), null);
  assert.ok(readAccessToken(signAccessToken(LEAD, SID)!.token));
});
test("access length can be configured within 1–365 days", () => {
  process.env.PORTAL_ACCESS_DAYS = "30"; assert.equal(accessDays(), 30);
  process.env.PORTAL_ACCESS_DAYS = "0"; assert.equal(accessDays(), 90);
  process.env.PORTAL_ACCESS_DAYS = "abc"; assert.equal(accessDays(), 90);
});
test("source access: Adzuna open until approved; others verified; overridable", () => {
  assert.equal(sourceAccess("adzuna"), "open");
  assert.equal(sourceAccess("reed"), "verified");
  assert.equal(sourceAccess("unknown_feed"), "verified");
  process.env.JOB_SOURCE_ACCESS_ADZUNA = "hidden";
  assert.equal(sourceAccess("adzuna"), "hidden");
  assert.deepEqual(hiddenSources(), ["adzuna"]);
  process.env.JOB_SOURCE_ACCESS_ADZUNA = "nonsense";
  assert.equal(sourceAccess("adzuna"), "open");
});

test("verification codes: keyed hash, constant-time match, old hashes still accepted briefly", () => {
  const h = hashOtp("123456");
  assert.notEqual(h, legacyHashOtp("123456"), "keyed, not a plain SHA-256");
  assert.ok(otpMatches("123456", h));
  assert.ok(!otpMatches("123457", h));
  assert.ok(otpMatches("123456", legacyHashOtp("123456")));
  process.env.PORTAL_ACCESS_SECRET = "another-secret-that-is-long-enough-abcdefg";
  assert.ok(!otpMatches("123456", h), "a different secret gives a different hash");
});
