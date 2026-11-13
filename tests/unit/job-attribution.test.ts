import { test } from "node:test";
import assert from "node:assert/strict";
import { adzunaHomeUrl } from "../../lib/job-attribution.ts";

test("Adzuna label links to the advert's local Adzuna site", () => {
  assert.equal(adzunaHomeUrl("https://www.adzuna.com.au/details/5963450623?utm_medium=api"), "https://www.adzuna.com.au");
  assert.equal(adzunaHomeUrl("https://www.adzuna.co.uk/details/1"), "https://www.adzuna.co.uk");
  assert.equal(adzunaHomeUrl("https://www.adzuna.co.za/details/1"), "https://www.adzuna.co.za");
  assert.equal(adzunaHomeUrl("https://www.adzuna.de/details/1"), "https://www.adzuna.de");
  assert.equal(adzunaHomeUrl("https://www.adzuna.com/details/1"), "https://www.adzuna.com");
});

test("anything that is not an Adzuna address falls back to adzuna.co.uk", () => {
  assert.equal(adzunaHomeUrl("https://www.reed.co.uk/jobs/1"), "https://www.adzuna.co.uk");
  assert.equal(adzunaHomeUrl("https://adzuna.co.uk.evil.example/x"), "https://www.adzuna.co.uk");
  assert.equal(adzunaHomeUrl("not a url"), "https://www.adzuna.co.uk");
  assert.equal(adzunaHomeUrl(null), "https://www.adzuna.co.uk");
});
