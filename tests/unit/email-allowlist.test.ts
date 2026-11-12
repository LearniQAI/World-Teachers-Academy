import { test } from "node:test";
import assert from "node:assert/strict";
import { emailAllowed } from "../../lib/email-allowlist.ts";

const OWNER = "info@docssa.co.za";

test("preview with no allowlist sends nothing", () => {
  assert.equal(emailAllowed(OWNER, { VERCEL_ENV: "preview" }), false);
});
test("preview sends only to listed addresses (case and spaces ignored)", () => {
  const env = { VERCEL_ENV: "preview", EMAIL_TEST_ALLOWLIST: " Info@DocsSA.co.za , delivered@resend.dev" };
  assert.equal(emailAllowed(OWNER, env), true);
  assert.equal(emailAllowed("delivered@resend.dev", env), true);
  assert.equal(emailAllowed("someone@gmail.com", env), false);
});
test("production without an allowlist is unchanged", () => {
  assert.equal(emailAllowed("someone@gmail.com", { VERCEL_ENV: "production" }), true);
});
test("local development without an allowlist is unchanged", () => {
  assert.equal(emailAllowed("someone@gmail.com", {}), true);
});
