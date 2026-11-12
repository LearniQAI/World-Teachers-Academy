// Fixtures follow each provider's documented response shape. Before any feed
// goes live, record one real response per provider and add it here.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normaliseAdzuna, normaliseReed, normaliseTeachingVacancy, normaliseUsaJob, countryCode, fingerprint,
} from "../../supabase/functions/_shared/jobs/normalise.ts";
import { classifyHttp, reedOutcome, usajobsOutcome, PROVIDERS, sourcesForVerification } from "../../supabase/functions/_shared/jobs/checks.ts";

test("Adzuna: predicted salary flagged, no closing date, apply link untouched", () => {
  const j = normaliseAdzuna({ id: 123, title: "Primary Teacher", redirect_url: "https://www.adzuna.co.uk/jobs/land/ad/123?se=x",
    company: { display_name: "Oak School" }, location: { display_name: "Leeds, West Yorkshire" },
    salary_min: 30000, salary_max: 30000, salary_is_predicted: "1", contract_time: "full_time", created: "2026-11-01T10:00:00Z" }, "gb");
  assert.equal(j.country, "GB");
  assert.equal(j.currency, "GBP");
  assert.equal(j.salary_is_predicted, true);
  assert.equal(j.closes_at, null);
  assert.equal(j.apply_url, "https://www.adzuna.co.uk/jobs/land/ad/123?se=x");
  assert.equal(j.source_name, "Adzuna");
  assert.equal(j.is_relevant, true);
});

test("Reed: closing date and salary period from the detail record", () => {
  const j = normaliseReed({ jobId: 555, jobTitle: "Supply Teacher", employerName: "Agency", locationName: "Leeds",
    minimumSalary: 150, maximumSalary: 200, salaryType: "per day", datePosted: "01/11/2026", expirationDate: "13/12/2026",
    jobUrl: "https://www.reed.co.uk/jobs/supply-teacher/555", contractType: "Temporary" });
  assert.equal(j.closes_at, "2026-12-13T23:59:59.000Z");
  assert.equal(j.salary_period, "day");
  assert.equal(j.employment_type, "contract");
  assert.equal(j.posted_at, "2026-11-01T00:00:00.000Z");
});

test("Teaching Vacancies: schema.org JobPosting", () => {
  const j = normaliseTeachingVacancy({ id: "abc-1", title: "Teacher of Maths", url: "https://teaching-vacancies.service.gov.uk/jobs/teacher-of-maths",
    datePosted: "2026-11-02T09:00:00+00:00", validThrough: "2026-11-30T12:00:00+00:00", employmentType: ["FULL_TIME"],
    hiringOrganization: { name: "Oak Academy" }, jobLocation: { address: { addressLocality: "Leeds", addressCountry: "GB" } },
    baseSalary: { currency: "GBP", value: { minValue: 31650, maxValue: 49084, unitText: "YEAR" } } });
  assert.equal(j.closes_at, "2026-11-30T12:00:00.000Z");
  assert.equal(j.salary_period, "year");
  assert.equal(j.country, "GB");
  assert.equal(j.employment_type, "full_time");
  assert.equal(j.source_name, "Teaching Vacancies (Department for Education)");
});

test("USAJOBS: eligibility kept verbatim and restriction flagged; overseas country mapped", () => {
  const j = normaliseUsaJob({ MatchedObjectId: "800001", MatchedObjectDescriptor: {
    PositionTitle: "Teacher (Elementary)", PositionURI: "https://www.usajobs.gov/job/800001",
    ApplyURI: ["https://www.usajobs.gov:443/GetJob/ViewDetails/800001?PostingChannelID="],
    OrganizationName: "DoD Education Activity", DepartmentName: "Department of Defense",
    PositionLocation: [{ CityName: "Kaiserslautern, Germany", CountryCode: "Germany" }],
    PositionRemuneration: [{ MinimumRange: "52000", MaximumRange: "98000", RateIntervalCode: "PA" }],
    PositionSchedule: [{ Name: "Full-time" }], PublicationStartDate: "2026-11-01T00:00:00.0000",
    ApplicationCloseDate: "2026-11-28T23:59:59.9970",
    UserArea: { Details: { WhoMayApply: { Name: "Current federal employees and military spouses" }, HiringPath: ["fed-competitive", "mspouse"] } } } });
  assert.equal(j.country, "DE");
  assert.equal(j.is_restricted, true);
  assert.equal(j.eligibility, "Current federal employees and military spouses");
  assert.equal(j.salary_period, "year");
  assert.ok(j.closes_at?.startsWith("2026-11-28"));
  const open = normaliseUsaJob({ MatchedObjectId: "2", MatchedObjectDescriptor: { PositionTitle: "Instructor", PositionURI: "u",
    UserArea: { Details: { HiringPath: ["public"] } } } });
  assert.equal(open.is_restricted, false);
});

test("country mapping refuses what it cannot be sure of", () => {
  assert.equal(countryCode("UK"), null);
  assert.equal(countryCode("Germany"), "DE");
  assert.equal(countryCode("Atlantis"), null);
  assert.equal(countryCode(""), null);
  assert.equal(countryCode("JP"), "JP");
});

test("same vacancy from two feeds gets the same fingerprint", () => {
  assert.equal(fingerprint("Teacher of Maths (MPS)", "Oak Academy", "Leeds, West Yorkshire", "GB"),
               fingerprint("Teacher of maths", "OAK ACADEMY", "Leeds", "GB"));
  assert.notEqual(fingerprint("Teacher of Maths", "Oak Academy", "Leeds", "GB"),
                  fingerprint("Teacher of Maths", "Oak Academy", "York", "GB"));
});

test("rate limits, server errors and network failures are transient — never 'gone'", () => {
  for (const s of [null, 429, 408, 500, 502, 503, 504, 302]) assert.equal(classifyHttp(s), "transient", String(s));
  assert.equal(classifyHttp(403), "blocked");
  assert.equal(classifyHttp(404), "not_found");
  assert.equal(classifyHttp(200), null);
});

test("Reed check outcomes", () => {
  const now = new Date("2026-11-12T12:00:00Z");
  assert.equal(reedOutcome(200, { expirationDate: "11/11/2026" }, now).outcome, "gone");
  assert.equal(reedOutcome(200, { expirationDate: "12/11/2026" }, now).outcome, "listed"); // open until end of day
  assert.equal(reedOutcome(429, null, now).outcome, "transient");
  assert.equal(reedOutcome(404, null, now).outcome, "not_found");
});

test("USAJOBS check outcomes: listed is not 'confirmed open'", () => {
  const now = new Date("2026-11-12T12:00:00Z");
  const item = (d: string) => ({ SearchResult: { SearchResultItems: [{ MatchedObjectDescriptor: { ApplicationCloseDate: d } }] } });
  assert.equal(usajobsOutcome(200, item("2026-11-30T23:59:59"), now).outcome, "listed");
  assert.equal(usajobsOutcome(200, item("2026-11-01T23:59:59"), now).outcome, "gone");
  assert.equal(usajobsOutcome(200, { SearchResult: { SearchResultItems: [] } }, now).outcome, "not_found");
  assert.equal(usajobsOutcome(200, {}, now).outcome, "transient");
  assert.equal(usajobsOutcome(503, null, now).outcome, "transient");
});

test("provider rules", () => {
  assert.equal(PROVIDERS.adzuna.linkCheck, false);
  assert.ok(!sourcesForVerification().includes("adzuna"));
  assert.deepEqual(sourcesForVerification().sort(), ["reed", "usajobs"]);
  assert.equal(PROVIDERS.adzuna.attribution?.minWidthPx, 116);
});
