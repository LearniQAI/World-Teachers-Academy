import { test } from "node:test";
import assert from "node:assert/strict";
import { verification, lastCheckedDate, closingLabel, sourceLabel } from "../../lib/job-trust.ts";
import { scrubNote } from "../../lib/job-report.ts";

const now = new Date("2026-11-12T12:00:00Z");

test("a successful check is 'listed', never 'confirmed open'", () => {
  const v = verification({ source: "reed", last_checked_at: "2026-11-12T08:00:00Z" }, now);
  assert.equal(v.tone, "listed");
  assert.doesNotMatch(v.label, /confirmed/i);
  assert.match(v.explain, /doesn't confirm/);
});
test("confirmed open only when the source said so", () => {
  const v = verification({ source: "reed", last_checked_at: "2026-11-12T08:00:00Z", last_confirmed_open_at: "2026-11-11T08:00:00Z" }, now);
  assert.equal(v.tone, "confirmed");
  assert.equal(v.label, "Confirmed open 11 Nov 2026");
});
test("uncertain jobs say so", () => {
  assert.equal(verification({ status: "uncertain", last_confirmed_open_at: "2026-11-11T08:00:00Z" }, now).tone, "uncertain");
});
test("before the migration: falls back to the feed date, labelled as the feed", () => {
  const j = { source: "adzuna", updated_at: "2026-11-12T03:00:00Z" };
  assert.equal(verification(j, now).label, "In the Adzuna feed");
  assert.deepEqual(lastCheckedDate(j), { date: "12 Nov 2026", how: "feed" });
  assert.equal(closingLabel(j), null);
});
test("old feed data is 'not checked recently'", () => {
  assert.equal(verification({ source: "adzuna", updated_at: "2026-11-01T03:00:00Z" }, now).tone, "unchecked");
});
test("source labels", () => {
  assert.equal(sourceLabel({ source: "teaching_vacancies" }), "Teaching Vacancies (Department for Education)");
  assert.equal(sourceLabel({ source: "x", source_name: "Named" }), "Named");
});
test("report notes lose e-mail addresses and phone numbers", () => {
  assert.equal(scrubNote("call me on +44 7700 900123 or a.b@example.com"), "call me on [removed] or [removed]");
  assert.equal(scrubNote("x".repeat(900))?.length, 500);
  assert.equal(scrubNote("   "), null);
  assert.equal(scrubNote(42), null);
});
