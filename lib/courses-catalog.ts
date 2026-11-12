// World Teachers Academy course catalog and release schedule — the ONE place
// that decides what each course card shows.
//
// Every course is free at this stage. A card shows one of three states:
//   - status "open"                          → "Free — Enrolment Open"
//   - status "coming_soon", launch ahead      → "Coming Soon" + live countdown
//   - status "coming_soon", launch has passed → "Launch Update Pending"
//
// A countdown reaching zero NEVER opens a course by itself. Opening a course is
// a deliberate change here (status → "open", after the owner's readiness
// check and approval) AND publishing the course in the LMS. The two must agree:
// an "open" card must point at a course that is published in the LMS.
//
// launchAt is a fixed timestamp written with the Johannesburg offset (+02:00,
// no daylight saving), so the countdown is the same on every device and after
// a refresh.
//
// profileUrl is the link to the course's profile page. Leave it null until the
// page exists — the card then shows no link instead of a dead or template page.

export type CourseStatus = "open" | "coming_soon";

export interface CourseCatalogEntry {
  slug: string;
  title: string;
  /** Card image, or null to show the designed title banner instead. */
  image: string | null;
  status: CourseStatus;
  /** Launch time, ISO 8601 with +02:00 offset (Africa/Johannesburg). */
  launchAt: string;
  /** Course profile page, or null when it doesn't exist yet. */
  profileUrl: string | null;
  /** Hours label shown on the designed banner when there is no image. */
  hours?: string;
  /** One line under the title. */
  summary: string;
}

export const LAUNCH_TIME_ZONE = "Africa/Johannesburg";

export const realCourses: CourseCatalogEntry[] = [
  {
    slug: "professional-online-teaching-tutoring-certification",
    title: "Professional Online Teaching & Tutoring Certification — 120 Hour",
    image: null,
    status: "open",
    launchAt: "2026-11-12T09:00:00+02:00",
    // LMS course 43748ec6-0bfa-419b-9209-1f09ed8a8b2e (published, free).
    profileUrl: "https://learn.worldteachers.academy/professional-online-teaching-tutoring-certification",
    hours: "120 Hours",
    summary:
      "Build the skills to plan, deliver and manage professional online lessons, communicate with learners and prepare for your teaching practicum.",
  },
  {
    slug: "tefl-certificate-130-hour",
    title: "TEFL Certificate — 130 Hour",
    image: "/assets/telf-130.jpeg",
    status: "coming_soon",
    launchAt: "2026-11-17T09:00:00+02:00",
    profileUrl: null,
    summary: "Your first step to teaching English in classrooms at home and abroad.",
  },
  {
    slug: "diploma-320-hour",
    title: "Diploma — 320 Hour",
    image: "/assets/diploma320.jpeg",
    status: "coming_soon",
    launchAt: "2026-11-22T09:00:00+02:00",
    profileUrl: null,
    summary: "Deepen your teaching practice with a broader professional diploma.",
  },
  {
    slug: "advanced-diploma-395-hour",
    title: "Advanced Diploma — 395 Hour",
    image: "/assets/adv-diploma%20395%20hours.jpeg",
    status: "coming_soon",
    launchAt: "2026-11-27T09:00:00+02:00",
    profileUrl: null,
    summary: "Advanced training for educators ready to take on more responsibility.",
  },
  {
    slug: "tefl-comprehensive-520-hour",
    title: "TEFL Comprehensive — 520 Hours",
    image: "/assets/520%20hours.jpeg",
    status: "coming_soon",
    launchAt: "2026-12-02T09:00:00+02:00",
    profileUrl: null,
    summary: "Our most complete TEFL programme, from first lessons to specialist skills.",
  },
  {
    slug: "supply-chain-management",
    title: "Supply Chain Management",
    image: "/assets/supply%20chain.jpeg",
    status: "coming_soon",
    launchAt: "2026-12-07T09:00:00+02:00",
    profileUrl: null,
    summary: "A professional course in planning, sourcing and moving goods efficiently.",
  },
];

/** "17 November 2026" — identical on server and browser (fixed time zone). */
export function formatLaunchDate(launchAt: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: LAUNCH_TIME_ZONE,
  }).format(new Date(launchAt));
}

/** Where a course's title and image link to, or null for no link. */
export function courseHref(course: CourseCatalogEntry): string | null {
  return course.profileUrl;
}

export function searchCourses(query: string): CourseCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return realCourses;
  return realCourses.filter((course) =>
    [course.title, course.summary].join(" ").toLowerCase().includes(q)
  );
}
