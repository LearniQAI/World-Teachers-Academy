// Real course catalog — the five actual World Teachers Academy courses,
// identified by the client-provided image assets (diploma320, 520 hours,
// supply chain, telf-130, adv-diploma 395 hours). Titles/hour-counts below
// are read directly off those filenames; anything not derivable from them
// (price, instructor, full description) is left as an explicit TBD
// placeholder rather than invented, matching the convention already used
// elsewhere in this codebase (see app/page.tsx "[Price TBD]").
//
// TODO: confirm the exact real title, price, and instructor for each course
// below. Two things need the client's confirmation in particular:
// - "520 hours.jpeg" has no course name in the filename — title is a
//   placeholder until the real course name is known.
// - "telf-130.jpeg" implies a 130-hour TEFL course, which conflicts with
//   the existing detailed TEFL entry in lib/mock-courses.ts (120 hours).
//   That discrepancy needs resolving before either number ships.
export interface CourseCatalogEntry {
  slug: string;
  title: string;
  image: string;
}

export const realCourses: CourseCatalogEntry[] = [
  {
    slug: "tefl-certificate-130-hour",
    title: "TEFL Certificate — 130 Hour",
    image: "/assets/telf-130.jpeg",
  },
  {
    slug: "diploma-320-hour",
    title: "Diploma — 320 Hour",
    image: "/assets/diploma320.jpeg",
  },
  {
    slug: "advanced-diploma-395-hour",
    title: "Advanced Diploma — 395 Hour",
    image: "/assets/adv-diploma%20395%20hours.jpeg",
  },
  {
    slug: "course-520-hour",
    title: "[Course Name TBD] — 520 Hour",
    image: "/assets/520%20hours.jpeg",
  },
  {
    slug: "supply-chain-management",
    title: "Supply Chain Management",
    image: "/assets/supply%20chain.jpeg",
  },
];
