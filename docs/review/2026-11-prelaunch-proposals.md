# Pre-launch proposals for owner approval (13 November 2026)

Nothing in this file has been published, except where marked **Done on
Preview**. Everything stays on `feat/courses-free-countdown` and the
protected Vercel Preview. No production database, credentials or deployment
changes are proposed for approval here.

---

## S1 — Floating "settings" button

**Finding: not part of the website.** The round dark button seen on the
right edge of earlier screenshots is drawn by the browser used for testing,
not by the site.

- No element exists at that position in the page (checked at desktop, tablet and mobile).
- The template's own colour switcher (`components/layout/ColorSwitcher.tsx`) is not used by any page on this branch or on `main`, so visitors never see it.
- No visitor setting or accessibility feature is involved.
- The "cut-off last word" on the /courses banner was the same overlay, not a site bug.

Recommendation: no site change needed. The unused `ColorSwitcher.tsx` can be
deleted with the other unused files after launch (L2).

---

## B1 — "Sign Up For Free Resources" form

### Findings
- The form posted to `mail.php`, which does not exist on Vercel (403). Every submission was lost.
- Its name and email boxes had no field names, so nothing would have been sent even with a working endpoint.
- Its subject list was the template's ("Software Development", "Digital Marketing", …).
- There is no consent wording, no spam protection and no database table for sign-ups. Staging has `leads` (job applications) and `marketing_suppressions` (opt-outs), but nothing for resource sign-ups.
- The Preview has no `SUPABASE_SERVICE_ROLE_KEY` and no email key, so a backend could not be tested end to end yet.

### Done on Preview (temporary)
The form is switched off behind `SHOW_RESOURCE_SIGNUP_FORM = false` (markup
kept). In its place: **"Free Resource Sign-Up Opens Soon"** — "We're setting
up our free resources mailing list and aren't collecting sign-ups yet. Until
it opens, all of our free guides and country information are available
without signing up." with buttons to Resources and Country Guides. Nothing
is collected.

### Proposed backend (needs approval before any database or backend work)
1. **Storage (staging only first):** new table `resource_signups` (id, name, email, interests, consent_text_version, consent_at, confirmed_at, source_ip_hash, user_agent, created_at). Row-level security on, no public read or write; inserts only through a server route.
2. **Server route `/api/resources/signup`:** validates on the server (name 2–80 characters, valid email, interests from a fixed list, consent box ticked), normalises the email, and returns clear messages.
3. **Spam protection:** hidden honeypot field; minimum time-to-submit check; rate limit per IP hash and per email (for example 5 per hour); optionally Cloudflare Turnstile later (needs a new account and keys, so separate approval).
4. **Consent (POPIA):** unticked box, required: "I agree to receive free resources and occasional updates from World Teachers Academy by email. I can unsubscribe at any time. See our Privacy Policy." Store the wording version and time.
5. **Double opt-in:** the sign-up is only confirmed when the visitor clicks a link in a confirmation email. Until email is configured (S7), sign-ups would be stored as unconfirmed and not emailed.
6. **Messages:** success — "Thank you. Check your inbox to confirm your sign-up."; already signed up — the same message (does not reveal whether an email exists); errors — specific field messages, or "We couldn't save your sign-up. Please try again later."
7. **Staging data safety:** on Preview the route accepts only addresses on `EMAIL_TEST_ALLOWLIST` (same safety net as email sending), so no real visitor details are collected on staging. Synthetic test data only.
8. **Interests list:** replace the template subjects with real ones, for example: TEFL & teaching English; Working abroad; Online teaching & tutoring; Career readiness; Coding & digital skills; Business English.

Approvals needed: (a) the design above; (b) applying the new table to
wta-staging (I will show the full SQL first); (c) adding the service-role key
to the Preview (you add it yourself, as before).

---

## B6 — Homepage FAQ: proposed wording

**Heading:** "Frequently Asked Questions" (was "Frequently Asked have any questions?")

| # | Current | Proposed |
|---|---------|----------|
| 1 | **Do I need work experience to get certified?** No — our foundational certifications are designed for both newcomers and experienced professionals. | **Do I need work experience to join a course?** No. You can join our courses without previous work experience. Each course description explains who it is designed for, so check it before you enrol. |
| 2 | **Are these certifications recognized internationally?** Yes, our certification programs follow internationally recognized standards accepted by employers and institutions worldwide. | **What will I receive when I complete a course?** When you complete a course, you receive a World Teachers Academy certificate showing the course title and its study hours. Requirements differ between countries and employers, so check what your chosen country or employer asks for. Our Country Guides explain what each destination typically requires. *(Please confirm a certificate is issued on completion.)* |
| 3 | **Can I find a job through World Teachers Academy after I'm certified?** Yes — our Job Portal lists verified international positions you can apply to directly on the employer's own website. | **Will you help me find a job?** Our Job Portal is still being prepared and is not open yet. We'll announce it when it opens. In the meantime, our Country Guides and Resources explain how to search and apply for roles abroad safely. |
| 4 | **How long does certification take?** This depends on the course — most programs range from a few days of intensive study to several weeks of self-paced learning. | **How long are the courses?** Our programmes range from 120 to 520 study hours: Professional Online Teaching & Tutoring (120 hours), TEFL Certificate (130), Diploma (320), Advanced Diploma (395) and TEFL Comprehensive (520). How long you take depends on how many hours a week you study. Study hours for Coding & Software Development, Business English and Supply Chain Management will be confirmed before those courses launch. |
| 5 | **Do you help with visa or relocation support for working abroad?** This depends on the program — check each course's details page for visa/relocation support information. | **Do you arrange visas or relocation?** No. We don't arrange visas, work permits or relocation. Our Country Guides explain the general requirements for each destination, but rules change, so always confirm current requirements with official government sources or your employer. *(Please confirm "No" is correct; otherwise remove this question.)* |
| 6 | — | **Are the courses free?** Our launch courses are free. Pricing for Coding & Software Development and Business English Communication & Professional Skills will be confirmed before they launch. |

No links to nonexistent pages remain (the old visa answer pointed to course
details pages that do not exist). Links used: `/countries`, `/resources`
(both exist).

Related: the separate `/faqs` page says the Job Portal is working ("How does
the Job Portal work?"). Proposed to align it with B4 once approved.

---

## B2 — Testimonials inventory (nothing verified)

| Where | Item | What's shown | What's needed |
|---|---|---|---|
| Homepage "Hear From Our Students" | 4 YouTube videos `eIfd4NEZyNg`, `Yi9lpwk1dxg`, `-gMCdjqscSc`, `M59LuXqw8UY` | Captions "Student Testimonial 1–4"; speakers not identified | Who each speaker is, which WTA course they took, written permission, and who owns the YouTube channel |
| Homepage "What Our Learners Say" and /courses | Anika van der Merwe | Photo + quote about an "online mentorship program" and "university studies" | Real learner? Permission? WTA does not offer a mentorship programme |
| same | Liam du Plessis | Quote about "personalized advice and industry insights" | as above |
| same | Lwazi Mokoena | Quote about "connecting one-on-one with an industry expert" | as above |
| same | Zola Dlamini | Quote about "resources and mentorship platform" | as above |
| same | Priya Naidoo | Quote "This mentorship framework is absolute gold…" | as above |
| same | Keegan van Rooyen | Quote about "direct access to experienced professionals" | as above |

The six quotes describe services WTA does not offer (mentorship, one-to-one
experts), which strongly suggests template or placeholder content. Their
photos are 1.8–2.1 MB files of unknown origin.

Recommendation: add a single switch that hides both testimonial sections
(homepage and /courses) and keep it off for the public release until you
confirm each item. I'll show screenshots of the page without them before
switching it on the Preview.

---

## B3 — Recognition and accreditation claims

No accreditation body, licence or endorsement is named anywhere on the site,
so there is no verified accreditation information to preserve.

| # | Where | Current | Proposed |
|---|---|---|---|
| 1 | Homepage "Why choose" card | **Recognized Certification** — Credentials that employers and recruiters actually trust. | **Clear Certification** — Each certificate shows your course and its study hours, so employers can see exactly what you completed. |
| 2 | same | **Certified Trainers** — Learn from trainers with real international experience, not just theory. | **Practical Training** — Lessons focus on skills you can use, not just theory. |
| 3 | same | **Support That Doesn't Disappear** — Real help before, during, and after certification. | **Support When You Need It** — Contact our team with questions before and during your course. |
| 4 | Homepage "Learn From Real-World Experience" | Every course here is built by professionals who have genuinely lived and worked abroad — not a generic curriculum… That's the difference between a certificate and real preparation. | Our courses focus on practical skills and real-world preparation for working internationally, alongside free Country Guides that explain what each destination expects. *(Keep the original only if you can evidence the trainers' backgrounds.)* |
| 5 | Homepage "Everything You Need…" | **Certified Career Programmes** — Every course is designed around real workplace needs… built by people with genuine international experience. | **Career Programmes** — Courses designed around practical, real-world skills. |
| 6 | Homepage FAQ | "internationally recognized standards accepted by employers and institutions worldwide" | See B6, question 2 |
| 7 | Country page: Taiwan | "Get accredited, connect with verified school sponsors… and secure your Alien Resident Certificate with ease." | "Prepare with World Teachers Academy: build your qualifications, research schools carefully and follow the official Alien Resident Certificate process." |
| 8 | Country page: Thailand | "Obtain your TEFL certification, master cultural nuances, and secure verified school placements…" | "Build your TEFL skills, learn the cultural essentials and research schools carefully before you accept an offer." |
| 9 | Country page: Vietnam | "…connect with reputable public and international school partners…" | "…and research reputable public and international schools in Hanoi and Ho Chi Minh City." |
| 10 | Country page: Central Europe | "Access structured dossiers, verified school directories, and visa application kits." | "Use our country guide to understand the paperwork, research schools and plan your visa application." |

**Status (13 Nov 2026, approved and applied on the Preview):** items 2–5 and
7–10 use the proposed wording; item 6 was done in B6. Item 1 uses interim
wording ("Clear Course Information — Each course sets out what you will learn
and when it opens…") because the proposed text promised certificate details
that are not yet confirmed in the course platform. Also softened: country-page
descriptions of third-party resources as "verified" (Taiwan, Thailand, Saudi
Arabia, Spain, South Korea) and two "guaranteed placement" provider
descriptions (Costa Rica). Resources advice to check accreditation is kept.

Note: several Resources articles (correctly) advise readers to choose an
**accredited** 120-hour+ TEFL course. If WTA's TEFL courses are accredited,
we should say by whom on the course cards; if not, that advice may lead
visitors to question our own courses. This needs your decision.

---

## B4 — Job Portal: proposed "coming soon" wording

| Where | Current | Proposed |
|---|---|---|
| Hero stat strip | Verified / Job Listings · Direct / Applications | 8 / Programmes · Practical / Career Skills |
| Homepage "Everything You Need…" paragraph | "…to a live directory of verified jobs across multiple countries…" | "…From practical certification courses to free country guides — with a job portal coming soon — we bring training and international opportunities together in one place." |
| Homepage small card | **Verified Job Listings** — Browse verified international vacancies and apply directly on the employer's own website. | **Job Portal — Coming Soon** — We're preparing a portal that links to international vacancies. We'll announce it when it opens. |
| Homepage "Why choose" card | **Direct Job Access** — Finish your certification and go straight to real job listings… | **Job Search Guidance** — Our guides explain how to search and apply for roles abroad safely. Job Portal coming soon. |
| Blue band | Direct / Applications to Employers | Practical / Skills for Work |
| Category card (your wording, 23:48) | International Job Search — Discover international vacancies and apply directly to employers. → /job-portal | International Job Search — Learn how to search and apply for roles abroad. Our Job Portal is coming soon. → /resources |
| Header, mobile menu, footer | "Job Portal" → /job-portal (live listing) | Either remove the link, or label it "Job Portal (Coming Soon)" pointing to a short coming-soon page. Your choice. |
| /faqs page | How does the Job Portal work? | Is the Job Portal open? — Not yet. We're preparing it and will announce it when it opens. |

Note: production (`main`) currently shows the job portal (menu link and a
working /job-portal page). Whatever you decide here changes production at
release.

---

## B5 — Dependency and risk report

### What the branch contains (vs `main`)
- **Website content (approved or reviewable):** homepage, course catalogue and cards, course images, hero/banner/category images, CSS, header/footer/menus, layout and metadata, plus wording changes on About, FAQs, Support, Countries and Resources pages from 12 November (not yet reviewed section by section).
- **Job portal and email-verification backend (not approved for production):** `app/api/jobs/*`, `app/api/leads/*`, `app/api/portal/session`, `app/job-portal/page.tsx`, `components/jobs/*`, `lib/jobs-query.ts`, `lib/job-*.ts`, `lib/portal-*.ts`, `lib/leads.ts`, `lib/source-access.ts`, `lib/resend.ts` / `lib/email-allowlist.ts`, `supabase/functions/*`.

### Dependencies found
- The backend code uses tables and columns from staging steps **05 and 06** (job checks/reports, job status columns, `portal_sessions`, `marketing_suppressions`) that production does not have, and env vars `PORTAL_ACCESS_SECRET`, `PORTAL_ACCESS_DAYS` (optional `OTP_PEPPER`) that production does not have.
- The approved homepage and course redesign does **not** depend on them: the homepage imports `getJobStats` but never calls it (`SHOW_JOB_PORTAL = false`); the course catalogue, cards, countdowns and images are static code and files.

### Risks of merging the whole branch now
- The live production job portal and apply/verify flow would run new code against the old schema: missing `portal_sessions` and report tables would cause failed verifications and server errors; missing `PORTAL_ACCESS_SECRET` disables portal sessions.
- Unreviewed wording changes on other pages would go live.

### Options
- **A (recommended): website-only release.** Create a release branch from `main` with only the website-content changes (no backend files above), test it on its own protected Preview, run CI, then ask you to approve a production deploy. No database or credential changes.
- **B:** merge everything with production migrations and new credentials — not approved.
- **C:** merge everything with the job portal backend switched off by flags — more code changes and more risk than A.

Before A: decide which non-homepage page changes (About, FAQs, Support, Countries, Resources) are included, and settle B2, B3 and B4 so the release doesn't carry unverified claims.

---

## B7 — Lint and CI

- **Command:** `npm run lint` (runs `eslint` with `eslint.config.mjs`, Next.js core-web-vitals + TypeScript rules). Locally: `npm ci && npm run lint`.
- **CI:** `.github/workflows/ci.yml` now runs on every push to `feat/**` and `fix/**`, on pull requests to `main`, and on demand: `npm ci` → `npm run lint` → `npx tsc --noEmit` → unit tests → `npm run build`. It uses no secrets, cannot deploy, and cannot reach any database or email service.
- **First run (13 Nov):** lint failed with 273 errors and 4,288 warnings, so later steps did not run.
  - About 220 errors and almost all warnings come from the template's bundled JavaScript in `public/assets/js` (not our code). Recommended: exclude `public/assets/**` from lint.
  - About 50 errors are in our code: 30 × plain `<a>` links to internal pages instead of Next.js `<Link>`, 39 × `require()` in scripts/tests, 6 × unescaped quotes, 1 × `setState` inside an effect (`components/courses/CourseImage.tsx`), 1 × hook rule in a vendor file, and a few others in tests/scripts.
- Proposed next step: exclude vendor files, fix the real errors, and make lint, type check, unit tests and build all pass before any release.

---

## S2–S8 — Recommended order

1. **S6 Page titles** — quick, no design change, helps search results from day one.
2. **S8 Footer contact details** — your confirmation only.
3. **S2 Testimonial photo sizes** — only if B2 keeps any testimonials; otherwise moot.
4. **S3 Teaching-only wording on other pages** — wording proposals for your approval, page by page.
5. **S4 About section secondary photo and badge** and **S5 "Why choose"/FAQ photos** — design changes, done section by section with screenshots, like the course images.
6. **S7 Email service** — needed for B1 confirmation emails and any OTP flow; depends on the Resend owner decision.
