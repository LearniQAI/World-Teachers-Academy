// Uses a response recorded from the live Teaching Vacancies API (12 Nov 2026).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normaliseTeachingVacancy } from "../../supabase/functions/_shared/jobs/normalise.ts";
import { formatSalary } from "../../lib/job-salary.ts";

const page = JSON.parse(readFileSync(new URL("../fixtures/teaching-vacancies-page1.json", import.meta.url), "utf8"));
const jobs = page.data.map((j: never) => normaliseTeachingVacancy(j));
const by = (title: string) => jobs.find((j: { title: string }) => j.title === title)!;

test("licence recorded in the response is the Open Government Licence", () => {
  assert.match(page.info.license.url, /open-government-licence\/version\/3/);
});
test("every job: GB, listing URL as id, closing date, source named", () => {
  for (const j of jobs) {
    assert.equal(j.country, "GB");
    assert.equal(j.external_id, j.apply_url);
    assert.ok(j.closes_at, j.title);
    assert.equal(j.source_name, "Teaching Vacancies (Department for Education)");
  }
  assert.equal(new Set(jobs.map((j: { external_id: string }) => j.external_id)).size, jobs.length);
});
test("free-text salaries are kept verbatim, never turned into numbers", () => {
  const cover = by("Cover Supervisor");
  assert.equal(cover.salary_min, null);
  assert.equal(cover.salary_text, "£20,225.00 - £22,249.00 Annually (Actual)");
  assert.equal(formatSalary(cover).text, "£20,225.00 - £22,249.00 Annually (Actual)");
  const ta = by("1:1 Support Assistant");
  assert.equal(ta.salary_text, "£25,614.00 - £26,016.00 Annually (FTE)"); // pro-rata line not mixed in
  assert.equal(by("Exam Invigilator").salary_text, "£14.80 per hour");
  assert.equal(by("Assistant Head of Year").salary_text, "M1 - M6");
  assert.equal(formatSalary(by("House Support Assistant")).text, "Salary not specified");
  assert.ok(formatSalary(by("Welfare & Safeguarding Lead (Gravesend)")).text.endsWith("…"));
});
test("education roles kept; admin, finance, catering, site and business roles dropped", () => {
  const kept = jobs.filter((j: { is_relevant: boolean }) => j.is_relevant).map((j: { title: string }) => j.title).sort();
  assert.deepEqual(kept, [
    "1:1 Support Assistant", "Assistant Head of Year", "Behaviour Lead and Flexipod Officer",
    "Core Curr Leader with Whole School Areas of Resp", "Cover Supervisor", "Exam Invigilator",
    "Higher Level Support Assistant", "Inclusion Practitioner", "SEN Intervention Assistant (across 3 schools)",
    "SEND Improvement Lead", "Teacher - Coritani Tribe at Kirton Lindsey Primary Academy",
  ]);
});
test("employment types from schema.org", () => {
  assert.equal(by("Cover Supervisor").employment_type, "full_time");
  assert.equal(by("Exam Invigilator").employment_type, "part_time");
});
