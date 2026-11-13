// World Teachers Academy course catalog and release schedule — the ONE place
// that decides what each course card shows.
//
// All eight courses are currently free (owner decision, 13 Nov 2026). A card
// shows one of three states:
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
// a refresh. Courses without a confirmed launch date use launchAt: null and
// show "Coming Soon" with no countdown — never an invented deadline.
//
// Owner-approved release schedule (12 Nov 2026), one course every five days
// at 09:00 Johannesburg time: 12 Nov (open), 17 Nov, 22 Nov, 27 Nov, 2 Dec,
// 7 Dec. These dates are a plan, not a switch: a passed date shows
// "Launch update pending" until the course is deliberately opened here.
//
// profileUrl is the link to the course's profile page. Leave it null until the
// page exists — the card then shows no link instead of a dead or template page.

export type CourseStatus = "open" | "coming_soon";

export interface CourseCatalogEntry {
  slug: string;
  title: string;
  /** Card image (path under /public), or null to show the designed title banner instead. */
  image: string | null;
  /** Alt text for the card image; defaults to the course title. */
  imageAlt?: string;
  /** Optional responsive versions of the image (srcset), e.g. smaller WebP files for phones. */
  imageSrcSet?: string;
  /**
   * Set to false to hide the "Free" label on the card image (e.g. if a
   * course's pricing ever changes). Defaults to showing it; all eight
   * courses currently show it.
   */
  showFreeLabel?: boolean;
  /**
   * Optional wording shown when the countdown reaches zero, replacing the
   * default "Launch update pending". Enrolment never opens automatically.
   */
  launchPendingLabel?: string;
  status: CourseStatus;
  /**
   * Planned launch time, ISO 8601 with +02:00 offset (Africa/Johannesburg).
   * Only set it for a GENUINE planned date — it drives a public countdown.
   * null = "Coming Soon" with no date and no countdown.
   */
  launchAt: string | null;
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
    // Owner-supplied photo (12 Nov 2026). If the file is ever missing, the card
    // falls back to the designed banner (see CourseImage), never a broken image.
    image: "/images/cape-town-online-teacher.png",
    imageAlt:
      "Black female online teacher teaching from her home in Cape Town, South Africa, with Table Mountain in the background",
    status: "open",
    launchAt: "2026-11-12T09:00:00+02:00",
    // LMS course 43748ec6-0bfa-419b-9209-1f09ed8a8b2e (published, free).
    profileUrl: "https://learn.worldteachers.academy/professional-online-teaching-tutoring-certification",
    // Owner-approved website title (12 Nov 2026). The LMS title stays
    // "Professional Online Teaching & Tutoring Certification" — do not change
    // production course data without approval. "120 Hour" is the intended
    // programme structure until learning hours and assessments are verified.
    hours: "120 Hours",
    summary:
      "Build the skills, confidence and practical experience to prepare for professional online teaching and tutoring opportunities worldwide.",
  },
  {
    slug: "tefl-certificate-130-hour",
    title: "TEFL Certificate — 130 Hour",
    // Owner-generated photo (13 Nov 2026), replacing the old banner with the
    // "WORL TEACHERS" typo. Master PNG kept at /images/tefl-certificate-130-hour.png.
    image: "/images/tefl-certificate-130-hour.webp",
    imageSrcSet: "/images/tefl-certificate-130-hour-752.webp 752w, /images/tefl-certificate-130-hour.webp 1504w",
    imageAlt: "South Asian English teacher teaching enthusiastic primary school students in a bright classroom",
    status: "coming_soon",
    // Exists in the LMS (fcf2852d-…, 25 lessons).
    launchAt: "2026-11-17T09:00:00+02:00",
    profileUrl: null,
    summary: "Your first step to teaching English in classrooms at home and abroad.",
  },
  {
    // Added 13 Nov 2026 at the owner's request. Scheduled launch 28 Nov 2026,
    // 09:00 SAST (15 days, same launch hour as the other courses). No profile
    // link and no enrolment button until the owner approves opening
    // registration. Free, like all courses (owner, 13 Nov 2026).
    slug: "coding-software-development",
    title: "Coding & Software Development — From Beginner to Career-Ready",
    image: "/images/coding-software-development.webp",
    imageSrcSet: "/images/coding-software-development-752.webp 752w, /images/coding-software-development.webp 1504w",
    imageAlt: "Software developer smiling at his laptop in a modern coding workspace with code on two monitors",
    launchPendingLabel: "Launch pending confirmation",
    status: "coming_soon",
    launchAt: "2026-11-28T09:00:00+02:00",
    profileUrl: null,
    summary:
      "Learn to code, build websites and develop practical programming skills for today\u2019s global digital workplace.",
  },
  {
    // Added 13 Nov 2026 at the owner's request. Scheduled launch 28 Nov 2026,
    // 09:00 SAST. Not in the LMS yet: no profile link and no enrolment button
    // until the owner approves opening registration. Free, like all courses
    // (owner, 13 Nov 2026). Owner-generated photo (13 Nov 2026);
    // master PNG at /images/business-english-communication.png.
    slug: "business-english-professional-skills",
    title: "Business English Communication & Professional Skills",
    image: "/images/business-english-communication.webp",
    imageSrcSet: "/images/business-english-communication-752.webp 752w, /images/business-english-communication.webp 1504w",
    imageAlt: "International professionals participating in a Business English communication workshop",
    launchPendingLabel: "Launch pending confirmation",
    status: "coming_soon",
    launchAt: "2026-11-28T09:00:00+02:00",
    profileUrl: null,
    summary:
      "Build confidence in business English, professional communication, workplace meetings and international career opportunities.",
  },
  {
    slug: "advanced-diploma-395-hour",
    title: "Advanced Diploma — 395 Hour",
    // Owner-generated photo (13 Nov 2026), replacing the "WORL TEACHERS" banner.
    // Master PNG at /images/tefl-advanced-diploma-395.png.
    image: "/images/tefl-advanced-diploma-395.webp",
    imageSrcSet: "/images/tefl-advanced-diploma-395-752.webp 752w, /images/tefl-advanced-diploma-395.webp 1504w",
    imageAlt: "Experienced North African educator mentoring two teachers in a modern international teacher-training centre",
    status: "coming_soon",
    launchAt: "2026-11-27T09:00:00+02:00",
    profileUrl: null,
    summary: "Advanced training for educators ready to take on more responsibility.",
  },
  {
    slug: "tefl-comprehensive-520-hour",
    title: "TEFL Comprehensive — 520 Hours",
    // Owner-generated photo (13 Nov 2026), replacing the "WORL TEACHERS" banner.
    // Master PNG at /images/tefl-comprehensive-520.png.
    image: "/images/tefl-comprehensive-520.webp",
    imageSrcSet: "/images/tefl-comprehensive-520-752.webp 752w, /images/tefl-comprehensive-520.webp 1504w",
    imageAlt: "Latin American educator teaching a multicultural group of adult learners in a modern classroom",
    status: "coming_soon",
    launchAt: "2026-12-02T09:00:00+02:00",
    profileUrl: null,
    summary: "Our most complete TEFL programme, from first lessons to specialist skills.",
  },
  {
    slug: "supply-chain-management",
    title: "Supply Chain Management",
    // Owner-generated photo (13 Nov 2026), replacing the red/yellow banner.
    // Master PNG at /images/supply-chain-management.png.
    image: "/images/supply-chain-management.webp",
    imageSrcSet: "/images/supply-chain-management-752.webp 752w, /images/supply-chain-management.webp 1504w",
    imageAlt: "Black African female logistics coordinator using a tablet in a modern international warehouse",
    status: "coming_soon",
    launchAt: "2026-12-07T09:00:00+02:00",
    profileUrl: null,
    summary: "A professional course in planning, sourcing and moving goods efficiently.",
  },
  {
    // Moved to position 8 on 13 Nov 2026 at the owner's request (unchanged otherwise).
    slug: "diploma-320-hour",
    title: "Diploma — 320 Hour",
    // Owner-generated photo (13 Nov 2026), replacing the "WORL TEACHERS" banner.
    // Master PNG at /images/tefl-diploma-320.png.
    image: "/images/tefl-diploma-320.webp",
    imageSrcSet: "/images/tefl-diploma-320-752.webp 752w, /images/tefl-diploma-320.webp 1504w",
    imageAlt: "Southeast Asian female educator leading an interactive English teaching workshop with international students",
    status: "coming_soon",
    launchAt: "2026-11-22T09:00:00+02:00",
    profileUrl: null,
    summary: "Deepen your teaching practice with a broader professional diploma.",
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
