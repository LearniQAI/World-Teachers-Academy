import { test } from "node:test";
import assert from "node:assert/strict";
import { formatSalary } from "../../lib/job-salary.ts";

const f = (salary_min: number | null, salary_max: number | null, currency: string | null, extra = {}) =>
  formatSalary({ salary_min, salary_max, currency, ...extra }).text;

test("annual salaries", () => {
  assert.equal(f(28000, 38000, "GBP"), "GBP 28K–38K a year");
  assert.equal(f(0, 51000, "GBP"), "Up to GBP 51K a year");
  assert.equal(f(65000, null, "AUD"), "From AUD 65K a year");
});
test("unknown period is never guessed", () => {
  assert.equal(f(105, 110, "GBP"), "GBP 105–110 · rate as advertised");
  assert.equal(f(14.25, 16.65, "GBP"), "GBP 14.25–16.65 · rate as advertised");
  assert.equal(f(50000, 50000, "XYZ"), "XYZ 50K · rate as advertised");
});
test("missing, zero and estimated salaries are not shown", () => {
  assert.equal(f(null, null, "GBP"), "Salary not specified");
  assert.equal(f(0, 0, "GBP"), "Salary not specified");
  assert.equal(f(30000, 40000, "GBP", { salary_is_predicted: true }), "Salary not specified");
});
test("a period stated by the source wins", () => {
  assert.equal(f(150, 200, "GBP", { salary_period: "day" }), "GBP 150–200 a day");
  assert.equal(f(25, 30, "USD", { salary_period: "hour" }), "USD 25–30 an hour");
  assert.equal(f(52000, 70000, "USD", { salary_period: "year" }), "USD 52K–70K a year");
});
