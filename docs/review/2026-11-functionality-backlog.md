# Functionality review backlog and pre-launch review

First recorded 12 November 2026. Updated 13 November 2026 after the Featured
Courses redesign was approved on the protected Preview.

Nothing in this file is approved for production. Merging into `main`, deploying
to production, production database migrations and production environment
changes all need the owner's separate, explicit approval.

## 1. Completed on the feature branch (Preview only)

| Area | Status |
|------|--------|
| Homepage hero ("Your Future Has No Borders.") | Approved |
| Category cards (6 cards, mixed order, Digital Skills → `/courses?q=Coding`) | Approved |
| "Everything You Need to Build a Global Career" main photo | Approved (secondary photo and badge still open, see S4) |
| Promotional banner ("Free Training. Global Opportunities.") | Approved |
| Featured Courses: 8 courses, new photos for 7 of them, countdowns | Approved 13 Nov |
| All eight courses free: every card shows "Free"; homepage line "All our courses are currently free, with more programmes coming soon."; FAQ "Are the courses free?" on homepage and /faqs (same wording) | Approved 13 Nov |
| Coding & Business English: 28 Nov 09:00 SAST countdown, Free label, enrolment disabled, "Launch pending confirmation" at zero | Approved |
| Countdowns never open enrolment: an upcoming course stays pending until the owner explicitly approves its launch | Owner rule, 13 Nov |
| "Every course is free" wording corrected on homepage and /courses | Approved |
| Old "WORL TEACHERS" banners: no longer used by any active page; `lib/mock-courses.ts` (unused) repointed | Done. Original files kept in `public/assets` until after release |
| Staging database (wta-staging) steps 00–08, email allowlist safety net | Done (staging only) |

## 2. Must fix or decide before launch

| # | Item | Where | What is needed |
|---|------|-------|----------------|
| B1 | "Sign Up For Free Resources" form does not work | Homepage, `app/page.tsx` (form posts to `mail.php`, which does not exist on Vercel) | Connect it (e.g. LeadsMind or email) with consent wording and spam protection, or hide it. Today a visitor's message is lost. |
| B2 | Testimonials not verified | Homepage video testimonials ("Student Testimonial 1–4", `components/home/VideoTestimonials.tsx`) and six named text testimonials (`components/home/TextTestimonials.tsx`, also on /courses) | Confirm each is a real learner who gave permission, or remove. Unverified testimonials are a consumer-protection risk. |
| B3 | Unverified recognition claims | Homepage: "Recognized Certification — credentials employers and recruiters actually trust", "Certified Trainers", "built by professionals who have genuinely lived and worked abroad"; FAQ "Yes, … internationally recognized standards accepted by employers and institutions worldwide" | Provide evidence (accreditation body, trainer credentials) or soften the wording. |
| B4 | Job portal promises vs. status | Homepage "live directory of verified jobs", "Direct Job Access", FAQ "our Job Portal lists verified international positions"; header and footer link to `/job-portal` while the homepage job section is switched off | Decide whether the job portal is part of this launch. Adzuna licensing is still unresolved. If not launching it, reword these lines and hide the links. |
| B5 | Production release dependency | Branch includes job-portal and lead-verification code that needs database steps 05–06 (job verification, portal access) and environment variables (`PORTAL_ACCESS_SECRET`, `PORTAL_ACCESS_DAYS`, optional `OTP_PEPPER`) that production does not have | Choose a release plan: (a) approve production migrations and env vars, or (b) release the homepage/course changes separately from the job-portal backend. Also add `SUPABASE_SERVICE_ROLE_KEY` to the branch Preview so the apply/verify flow can be tested end to end. |
| B6 | FAQ content | Homepage FAQ | Heading reads "Frequently Asked have any questions?". "How long does certification take?" says "a few days … to several weeks", which conflicts with 120–520 hour courses. Visa FAQ points to course details pages that do not exist yet. Confirm or remove the visa FAQ. |
| B7 | Lint not run | Whole project | Next.js 16 no longer lints during `next build` (Vercel builds pass). ESLint is not installed in this workspace; run `npm run lint` locally or in CI and fix findings. |

## 3. Should fix before launch (quality, consistency, performance)

| # | Item | Where | What is needed |
|---|------|-------|----------------|
| S1 | Mobile floating settings button overlaps text (noted 13 Nov) | Template's round floating button, right edge mid-screen on every page; e.g. last word of the /courses banner sentence | Hide it on small screens, move it, or remove it (it is a template demo control, not a visitor feature). |
| S2 | Very large testimonial photos | `public/assets/Testimonial image 2–6.jpeg` (1.8–2.1 MB each) and `Image testimonial 1.jpeg` load on the homepage and /courses | Resize and convert to WebP (about 50–80 KB each) once B2 is settled. |
| S3 | Wording on other pages still teaching-only | `lib/countries-data.ts` (8 places, e.g. "Teaching in Japan" page titles), `app/job-portal/page.tsx` (4), `app/about/page.tsx` (1) | Align with the broader career positioning. |
| S4 | About section secondary photo and circle badge | `more-aboutus-2.jpg` (template, 1.8 MB); badge reads "WTA" | Replace the photo; confirm or change the badge word. |
| S5 | "Why choose" and FAQ photos | Why section classroom photo has chalkboard writing and is teaching-only; FAQ photo shows a certificate reading "Teaching Certificate"; two "why" cards use template stock photos | Replace in the same style as the approved course photos (no embedded text). |
| S6 | Page titles | Every page except country and blog pages uses the homepage title | Give each page its own title and description for search results. |
| S7 | Email sending | Resend account owner and key not confirmed; email is off on the Preview | Needed if OTP verification is part of launch. |
| S8 | Footer contact details | "267 Oak Avenue Ferndale, Randburg, Johannesburg"; hello@worldteachers.academy | Confirm they are current. |

## 4. After launch

| # | Item | Notes |
|---|------|-------|
| L1 | Delete unused old images | Keep until the production release is verified (owner instruction, 13 Nov). Unused today: `telf-130.jpeg`, `supply chain.jpeg`, `diploma320.jpeg`, `adv-diploma 395 hours.jpeg`, `520 hours.jpeg` (last three only referenced by the unused `lib/mock-courses.ts` before 13 Nov), plus unused template files `1920X400.png`, `291×497.png`, `418×475.png`, `808x500 .png`, `FAQ1.png`, `FAQ2.jpg`, `FAQ3.jpg`, `Resouces page image .png`, `Resources-herosection.jpg`, `World Teachers Logo.jpeg`, `certification card image.jpg`, `hero-teacher1.png`, `left.png`, `right.png`, `podcast-cover.png`, `support card image.jpg` (about 15 MB in total). |
| L2 | Unused components | `components/home/HomeHero.tsx` and `HomeSections.tsx` are not imported anywhere (they reference `hero-teacher.png`, 2.8 MB, and `more-aboutus-1.jpg`, 2.5 MB). |
| L3 | Hidden template sections | Homepage "Upcoming Educational Events" and "Latest News & Blog" are switched off (placeholder content with broken `.html` links). Keep them off unless real content is added. |
| L4 | /courses desktop grid | 8 cards show as 3 + 3 + 2; fine as is. |
