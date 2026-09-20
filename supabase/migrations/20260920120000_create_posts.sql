-- Blog: posts (rendered from markdown on /blog, /blog/[slug], the side panel)

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_markdown text not null,
  cover_image_url text,
  category text not null,
  author text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Public (anon) can read published posts only.
create policy "Public can read published posts"
  on public.posts for select
  using (published = true);

create policy "Service role can do anything"
  on public.posts for all
  using (auth.role() = 'service_role');

-- Seed: three sample posts, one per category used on the blog page.
-- Editorial copy drawn from the WTA country guides — review before treating as final.
insert into public.posts (slug, title, excerpt, body_markdown, cover_image_url, category, author, published, published_at)
values
(
  'which-visa-are-you-actually-on',
  'Which Visa Are You Actually On? A Plain-English Guide for Teachers Abroad',
  'Some countries have one legal route in, others have three. Here is how to tell the legal standard from the common workaround before you sign anything.',
  $body$
The single most useful question you can ask before accepting a teaching job abroad is: **which visa will I actually be on?** The answer changes your legal protection, your access to healthcare, and how much risk you carry.

## Countries with one legal route

In **China**, the Z-visa is the only legal way to teach. A bachelor's degree, an accredited TEFL/TESOL certificate (120+ hours, or two years' documented experience) and a clean background check are non-negotiable. If a school suggests starting on a tourist or business visa "for now", treat it as a red flag, and remember that legitimate schools never charge a placement fee.

In **Cambodia**, working on a tourist visa is illegal. Confirm that your employer arranges a genuine work permit and visa before you start.

## Countries with more than one route

**Argentina** has a formal work visa (employer-sponsored, with a signed contract), a Digital Nomad Visa for online earners (proof of at least $1,500 a month in foreign-sourced earnings), and the widely used "Uruguay run": a renewable 90-day tourist visa reset with a short trip across the border. The last one is common, but it is a workaround, not the legal standard.

**Brazil** offers the VITEM V work visa, which requires a confirmed employment offer, and the VITEM XIV Digital Nomad visa. Repeated tourist-visa extensions to keep working informally carry real legal risk.

**Costa Rica** has three tiers: the sponsored Categoría Especial visa (with CCSS healthcare and the annual aguinaldo bonus), tourist visa plus self-employment (a grey area with no healthcare access), and undocumented work, which is the one to avoid entirely.

## A quick checklist

- Ask the employer in writing which visa they will sponsor.
- Find out how long processing takes. In Chile, for example, the *sujeta a contrato* visa has recently taken six to eight months.
- Know what you cannot do on a tourist visa in that country.
- Never pay a recruiter to "guarantee" a visa.

Every country guide on World Teachers Academy includes a visa section written for South African teachers. Read the one for your destination before you commit.
$body$,
  '/assets/img/blog/blog_1_1.jpg',
  'Teaching Abroad',
  'World Teachers Academy',
  true,
  '2026-09-01 08:00:00+00'
),
(
  'choosing-a-tefl-certificate-that-employers-accept',
  'Choosing a TEFL Certificate That Employers Actually Accept',
  'Not every certificate opens the same doors. What to check before you enrol, and why the details matter for visas as well as for hiring.',
  $body$
A TEFL or TESOL certificate is the practical minimum for most teaching jobs abroad. But two certificates with the same name can be treated very differently by employers and by immigration authorities.

## Why it matters beyond the job

Some visa processes look at your certificate directly. China's Z-visa, for instance, asks for an **accredited** TEFL/TESOL certificate of 120 or more hours (or two years of documented experience). Brazilian language schools typically expect a TEFL certificate plus a degree. In Cambodia, a TEFL certificate is often the practical minimum even where a degree is not required.

## What to check before you enrol

1. **Hours.** 120 hours is the figure commonly asked for. Shorter courses may not satisfy visa requirements.
2. **Accreditation.** Ask who accredits the course and check that the accreditor is real and independent.
3. **Assessment.** A credible course includes graded work, not just a payment page.
4. **Documentation.** You will need to provide your certificate for visa applications, so confirm you receive an official certificate and can request verified copies.
5. **Country fit.** Read the guide for the country you are targeting and confirm what its employers and visa rules expect.

## Degree or no degree?

Requirements differ widely. Cambodia is one of the few Asian markets where many language centres do not require a university degree. China and Brazil do. Costa Rica does not legally require one, but non-North-American applicants are often expected to hold one.

Browse the courses on World Teachers Academy to compare certification options, and use the country guides to check what your destination expects.
$body$,
  '/assets/img/blog/blog_1_2.jpg',
  'Certification News',
  'World Teachers Academy',
  true,
  '2026-09-08 08:00:00+00'
),
(
  'first-weeks-abroad-what-nobody-tells-you',
  'Your First Weeks Abroad: The Small Things That Build Trust',
  'Customs like the mate circle in Argentina or the sampeah in Cambodia are small, but getting them right earns real goodwill with colleagues.',
  $body$
New teachers usually prepare for the paperwork and forget the etiquette. Yet the small customs are often what colleagues notice first, and what makes the difference between feeling like a visitor and feeling like part of the staff room.

## Greetings and hospitality

- **Cambodia:** return the *sampeah* (palms together, a slight bow) when it is offered.
- **Costa Rica:** accept the coffee or snack you are offered in someone's home. Refusing can come across as impolite.
- **Brazil:** expect warmer, closer greetings than you may be used to, sometimes with cheek kisses between friends, and don't stand back excessively during conversation.

## Shared rituals

In **Argentina**, mate is passed around a group. Accept it graciously, hand it back without a word to stay in the rotation, and say "gracias" only when you are ready to stop.

## Timing and pace

Dinner in Argentina rarely happens before 9 or 10pm. In Brazil, arriving 15 to 30 minutes late to a dinner invitation is normal. In France, meals are treated as real occasions and rarely rushed.

## Topics to leave to your colleagues

Some subjects are painful for many families. In **Cambodia** and **Chile**, let colleagues raise the country's 20th-century history themselves, and listen with care if they do.

## Protect other people's dignity

In **China**, protecting someone's *face* matters enormously, in the classroom too. Give feedback privately rather than in front of others.

None of this needs to be perfect. Being visibly willing to learn is what earns goodwill. Our country guides include a Do's and Don'ts list for each destination to help you prepare.
$body$,
  '/assets/img/blog/blog_1_3.jpg',
  'Community Stories',
  'World Teachers Academy',
  true,
  '2026-09-15 08:00:00+00'
)
on conflict (slug) do nothing;
