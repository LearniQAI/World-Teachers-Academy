import { test } from "node:test";
import assert from "node:assert/strict";
import { checkEnvironment, projectRefFromUrl } from "../../supabase/functions/_shared/jobs/guard.ts";

const env = (o: Record<string, string>) => ({ get: (k: string) => o[k] });
const PROD = "https://nxwmtcsezswjrignajdm.supabase.co";
const STAGING = "https://abcdefghijklmnopqrst.supabase.co";

test("refuses when the target project is not set", () => {
  assert.equal(checkEnvironment(env({ SUPABASE_URL: STAGING })).ok, false);
});
test("refuses a staging-configured job that finds itself on production", () => {
  const r = checkEnvironment(env({ SUPABASE_URL: PROD, JOBS_TARGET_PROJECT_REF: "abcdefghijklmnopqrst" }));
  assert.equal(r.ok, false);
  assert.match((r as { reason: string }).reason, /project mismatch/);
});
test("runs only the feeds switched on", () => {
  const r = checkEnvironment(env({ SUPABASE_URL: STAGING, JOBS_TARGET_PROJECT_REF: "abcdefghijklmnopqrst", JOBS_FEEDS_ENABLED: "adzuna, reed" }));
  assert.ok(r.ok && r.feeds.has("reed") && !r.feeds.has("usajobs"));
});
test("no feeds listed means nothing runs", () => {
  const r = checkEnvironment(env({ SUPABASE_URL: STAGING, JOBS_TARGET_PROJECT_REF: "abcdefghijklmnopqrst" }));
  assert.ok(r.ok && r.feeds.size === 0);
});
test("project ref parsing", () => {
  assert.equal(projectRefFromUrl(PROD), "nxwmtcsezswjrignajdm");
  assert.equal(projectRefFromUrl("http://127.0.0.1:54321"), "local");
  assert.equal(projectRefFromUrl("https://evil.example.com"), null);
});
