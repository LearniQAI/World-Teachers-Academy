import Image from "next/image";
import { realCourses } from "@/lib/courses-catalog";

// Approved homepage hero (12 Nov 2026).
// One orchestrated motion moment: the headline words rise in, the route card
// fills in Learn → Practise → Demonstrate → Get career-ready, then a soft light
// keeps travelling the route. The circle text turns slowly around the photo.
// Everything is CSS (public/assets/css/wta-home.css), so it renders the same in
// a production build with no client JavaScript, and it all switches off for
// visitors who prefer reduced motion.

const HEADLINE = "Your teaching career deserves more than a certificate.";
const RING_TEXT = "BUILD YOUR SKILLS • ELEVATE YOUR CAREER • INSPIRE GENERATIONS •";

const ROUTE = [
  { title: "Learn", text: "Practical lessons from classroom educators" },
  { title: "Practise", text: "Plan and deliver real lessons" },
  { title: "Demonstrate", text: "Show your skills in a practicum" },
  { title: "Get career-ready", text: "Profile, applications, interviews" },
];

const Arrow = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
    <path d="M8 1l6 6-6 6M14 7H1" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default function HomeHero() {
  const openCourse = realCourses.find((c) => c.status === "open" && c.profileUrl);
  const startHref = openCourse?.profileUrl ?? "#courses";

  return (
    <section className="wta-hero" aria-labelledby="wta-hero-title">
      <div className="wta-wrap wta-hero__grid">
        <div className="wta-hero__copy">
          <h1 id="wta-hero-title" className="wta-hero__title" aria-label={HEADLINE}>
            {HEADLINE.split(" ").map((word, i) => (
              <span key={i} aria-hidden="true">
                <span className="wta-word" style={{ animationDelay: `${0.05 + i * 0.08}s` }}>{word}</span>{" "}
              </span>
            ))}
          </h1>
          <p className="wta-hero__lede">Build the skills. Gain the confidence. Prepare for opportunities beyond borders.</p>
          <p className="wta-hero__body">
            World Teachers Academy helps aspiring and experienced educators turn potential into professional
            readiness, through practical training, real teaching preparation and career-focused resources.
          </p>
          <div className="wta-hero__ctas">
            <a className="wta-btn wta-btn--primary" href={startHref}>
              Start your free training <Arrow />
            </a>
            <a className="wta-btn wta-btn--ghost" href="#how-it-works">See how it works</a>
          </div>
          <p className="wta-hero__note">
            Free to start. Learn to{" "}
            <span className="wta-rotor">
              <span className="wta-rotor__item">teach with confidence.</span>
              <span className="wta-rotor__item" aria-hidden="true">grow beyond borders.</span>
              <span className="wta-rotor__item" aria-hidden="true">build your future.</span>
            </span>
          </p>
        </div>

        <div className="wta-stage">
          <div className="wta-stage__figure">
            <div className="wta-orb" aria-hidden="true">
              <div className="wta-orb__disc" />
              <svg className="wta-orb__ring" viewBox="0 0 300 300">
                <defs>
                  <path id="wta-ring-path" d="M150,150 m-138,0 a138,138 0 1,1 276,0 a138,138 0 1,1 -276,0" />
                </defs>
                <text>
                  <textPath href="#wta-ring-path">{RING_TEXT}</textPath>
                </text>
              </svg>
            </div>
            <div className="wta-person">
              <Image
                src="/assets/hero-teacher.png"
                alt="A smiling teacher holding a notebook and pen"
                width={2116}
                height={1984}
                sizes="(max-width: 640px) 86vw, (max-width: 1080px) 440px, 420px"
                loading="eager"
                fetchPriority="high"
              />
              {/* Indigo base in front of the photo's lower edge, sized from the photo so it
                  covers the same part of her at every screen size. */}
              <svg className="wta-person__base" viewBox="0 0 600 320" aria-hidden="true">
                <g transform="rotate(-9 300 140)">
                  <rect className="wta-base__back" x="250" y="40" width="420" height="120" rx="60" />
                  <rect className="wta-base__front" x="40" y="96" width="640" height="140" rx="70" />
                  <path className="wta-base__line" d="M95 112 C 200 96, 330 92, 470 94" />
                </g>
              </svg>
            </div>
          </div>

          <div className="wta-route">
            <h2 className="wta-route__title">Your route to career-ready</h2>
            <div className="wta-route__track">
            <i className="wta-route__runner" aria-hidden="true" />
            <ol className="wta-route__list">
              {ROUTE.map((stop, i) => (
                <li key={stop.title}>
                  {i < ROUTE.length - 1 && <i className="wta-route__fill" aria-hidden="true" />}
                  <b>{stop.title}</b>
                  <span>{stop.text}</span>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
