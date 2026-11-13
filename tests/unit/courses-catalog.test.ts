// Release checks for the course catalogue (owner-approved rules, 13 Nov 2026).
// If one of these fails, a course card would show something the owner has
// not approved: a missing "Free" label, an open enrolment, or a moved date.
import { test } from "node:test";
import assert from "node:assert/strict";
import { realCourses, formatLaunchDate, courseHref, searchCourses } from "../../lib/courses-catalog.ts";

test("eight courses, all showing the Free label", () => {
  assert.equal(realCourses.length, 8);
  for (const course of realCourses) {
    assert.notEqual(course.showFreeLabel, false, `${course.slug} hides its Free label`);
  }
});

test("only Online Teaching is open; every other course is Coming Soon with no link", () => {
  const open = realCourses.filter((c) => c.status === "open").map((c) => c.slug);
  assert.deepEqual(open, ["professional-online-teaching-tutoring-certification"]);
  for (const course of realCourses.filter((c) => c.status === "coming_soon")) {
    assert.equal(course.profileUrl, null, `${course.slug} has an enrolment/profile link`);
    assert.equal(courseHref(course), null);
  }
});

test("approved launch dates (09:00 Johannesburg time) are unchanged", () => {
  const dates = Object.fromEntries(realCourses.map((c) => [c.slug, c.launchAt]));
  assert.deepEqual(dates, {
    "professional-online-teaching-tutoring-certification": "2026-11-12T09:00:00+02:00",
    "tefl-certificate-130-hour": "2026-11-17T09:00:00+02:00",
    "coding-software-development": "2026-11-28T09:00:00+02:00",
    "business-english-professional-skills": "2026-11-28T09:00:00+02:00",
    "advanced-diploma-395-hour": "2026-11-27T09:00:00+02:00",
    "tefl-comprehensive-520-hour": "2026-12-02T09:00:00+02:00",
    "supply-chain-management": "2026-12-07T09:00:00+02:00",
    "diploma-320-hour": "2026-11-22T09:00:00+02:00",
  });
  assert.equal(formatLaunchDate("2026-11-28T09:00:00+02:00"), "28 November 2026");
});

test("Coding and Business English show 'Launch pending confirmation' at zero", () => {
  for (const slug of ["coding-software-development", "business-english-professional-skills"]) {
    const course = realCourses.find((c) => c.slug === slug);
    assert.equal(course?.launchPendingLabel, "Launch pending confirmation");
  }
});

test("search finds the Coding course (Digital Skills category link)", () => {
  assert.deepEqual(searchCourses("Coding").map((c) => c.slug), ["coding-software-development"]);
});
