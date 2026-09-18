import { mockCourses } from "@/lib/mock-courses";

// Real course catalog — the five actual World Teachers Academy courses,
// identified by the client-provided image assets (diploma320, 520 hours,
// supply chain, telf-130, adv-diploma 395 hours).
//
// Confirmed by the client: the TEFL course is 130 hours (not the 120 hours
// originally in lib/mock-courses.ts — that entry has been corrected to
// match), and the 520-hour course is "TEFL Comprehensive — 520 Hours".
//
// "supply-chain-management" intentionally has no matching entry in
// lib/mock-courses.ts yet — the client hasn't confirmed whether this course
// should exist on the site at all. Its slug here is a placeholder only;
// do NOT link it to /courses/supply-chain-management until that's resolved
// and a real mock-courses.ts entry exists, since the [slug] route silently
// falls back to mockCourses[0] (the TEFL course) for any unmapped slug —
// linking it now would show TEFL details mislabeled as Supply Chain.
//
// TODO: confirm price and instructor for every course below — still
// placeholders per the "[Price TBD]" convention used elsewhere.
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
    slug: "tefl-comprehensive-520-hour",
    title: "TEFL Comprehensive — 520 Hours",
    image: "/assets/520%20hours.jpeg",
  },
  {
    slug: "supply-chain-management",
    title: "Supply Chain Management",
    image: "/assets/supply%20chain.jpeg",
  },
];

// Card data (this file) only carries a title/image — the fuller
// title+description text used for search lives in lib/mock-courses.ts (the
// course-details page's data source). Cross-referenced by slug here so
// "Supply Chain Management" (no mock-courses.ts entry yet) still matches on
// title alone, while the other 4 courses also match on description content
// that isn't otherwise shown anywhere on the /courses listing itself.
export function searchCourses(query: string): CourseCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return realCourses;

  return realCourses.filter((course) => {
    const mock = mockCourses.find((m) => m.slug === course.slug);
    const haystack = [course.title, mock?.description.join(" ") ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
