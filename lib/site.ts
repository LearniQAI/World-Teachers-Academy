import { realCourses } from "@/lib/courses-catalog";

// Site-wide settings shared by the header, menus and footer.

/** Where "Start free training" goes: the open course's profile page. */
export const START_TRAINING_URL =
  realCourses.find((c) => c.status === "open" && c.profileUrl)?.profileUrl ?? "/#courses";

/** Certificate verification page, linked as "Verify" in the header and mobile menu. */
export const VERIFY_CERTIFICATE_URL = "https://www.leadsmind.io/certificates/verify";

/**
 * Student video testimonials on the home page: four YouTube Shorts supplied
 * and approved by the owner on 21 Nov 2026 (videos only, no names).
 */
export const SHOW_VIDEO_TESTIMONIALS: boolean = true;

/**
 * B2 (13 Nov 2026): the six named text quotes have not
 * been verified (identity, course taken, written permission). They stay hidden
 * until the owner confirms each one. The content is kept, not deleted:
 * components/home/TextTestimonials.tsx.
 */
export const SHOW_UNVERIFIED_TESTIMONIALS: boolean = false;

export const CONTACT_EMAIL = "hello@worldteachers.academy";

export const MISSION_LINE =
  "World Teachers Academy helps people build practical skills, professional confidence and career readiness for opportunities around the world.";

/**
 * Official World Teachers Academy social accounts. Empty until the owner
 * supplies the real profile URLs — the icons stay hidden rather than linking to
 * generic facebook.com / twitter.com home pages.
 * Example: { label: "Facebook", icon: "fab fa-facebook-f", href: "https://www.facebook.com/<page>" }
 */
export const SOCIAL_LINKS: { label: string; icon: string; href: string }[] = [];
