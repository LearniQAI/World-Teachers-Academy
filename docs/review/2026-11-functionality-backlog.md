# Functionality review backlog (separate from the image redesign)

Recorded 12 November 2026 at the owner's request. These items are **not approved
for production**. They must not delay the homepage image redesign.

| # | Item | Where | What is needed |
|---|------|-------|----------------|
| 1 | Student testimonial videos need authenticity checks | Homepage "Student Stories" (`components/home/VideoTestimonials.tsx`) | Confirm each video is a real WTA learner who has given permission. Then replace "Student Testimonial 1–4" with real names or roles, or remove the section. |
| 2 | "Sign Up For Free Resources" form is not connected | Homepage testimonials section (`app/page.tsx`, the form has no handler) | Decide where submissions go (for example LeadsMind or email). Add consent wording and spam protection, then connect the form. Until then it should not look as if it works. |
| 3 | Wording still focuses only on teaching | `app/about/page.tsx`, `lib/countries-data.ts` ("teaching opportunities"), `app/job-portal/page.tsx` | Update the wording to match the homepage, which covers international careers including teaching. |
| 4 | Lint has not been run | Whole project | Next.js 16 no longer lints during `next build`. Run `npm run lint` in CI or locally and fix the findings. |

Also noted during the homepage review (for the later review too):

- The circular badge in the About section now reads "WTA" in place of the template's "10 Years of Experience". Confirm or choose a better word.
- The FAQ "Do you help with visa or relocation support for working abroad?" needs a confirmed answer, or it should be removed.
- The homepage "Courses open now" and "Free" claims depend on the course catalogue (`lib/courses-catalog.ts`). Keep them in step if pricing changes.

Outstanding UI fixes (noted 13 November 2026):

- On mobile, the template's round floating settings button (right edge, mid-screen)
  overlaps the end of text it sits over — for example the last word of the /courses
  banner sentence ("…shown above"). Move it, shrink it or hide it on small screens.
