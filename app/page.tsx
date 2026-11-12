import HomeHero from "@/components/home/HomeHero";
import { HomeAbout, HomeBenefits, HomeCourses, HomeCta, HomeFaq, HomeHowItWorks } from "@/components/home/HomeSections";

// World Teachers Academy homepage — approved design (12 Nov 2026).
// Journey: Discover → Explore training → Start the free course → Build skills →
// Prepare for opportunities. Course cards and launch dates come from
// lib/courses-catalog.ts; styles from public/assets/css/wta-home.css.
//
// Retired template sections (stat strips, Learning Chart / 275k+ pictures,
// category carousel with dead links, 30%-off banner, events, template text
// testimonials, unconnected sign-up form, hidden Job Portal block) are in git
// history at commit b3c30b04. The four video testimonials
// (components/home/VideoTestimonials.tsx) are kept, but not shown until the
// owner confirms they are real WTA student stories.
export const revalidate = 3600;

export default function Home() {
  return (
    <main className="wta-home">
      <HomeHero />
      <HomeBenefits />
      <HomeCourses />
      <HomeHowItWorks />
      <HomeAbout />
      <HomeFaq />
      <HomeCta />
    </main>
  );
}
