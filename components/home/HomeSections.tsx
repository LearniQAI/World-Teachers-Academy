import Image from "next/image";
import CourseCard from "@/components/courses/CourseCard";
import { realCourses } from "@/lib/courses-catalog";

// Approved homepage sections below the hero (12 Nov 2026). Server components;
// styles in public/assets/css/wta-home.css. No statistics: every claim here is
// something World Teachers Academy can stand behind.

const BENEFITS = [
  {
    title: "Practical teacher training",
    text: "Build teaching skills through structured lessons and real classroom activities.",
    icon: (
      <>
        <path d="M3 6l9-3 9 3-9 3-9-3z" />
        <path d="M7 8v5c0 1.7 2.2 3 5 3s5-1.3 5-3V8" />
      </>
    ),
  },
  {
    title: "Career-focused development",
    text: "Develop the capabilities, confidence and professional presentation employers value.",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      </>
    ),
  },
  {
    title: "International teaching preparation",
    text: "Understand teaching environments, expectations and opportunities in different countries.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </>
    ),
  },
  {
    title: "Professional growth resources",
    text: "Use practical guides, tools and resources that support your development.",
    icon: (
      <>
        <path d="M4 19V5a2 2 0 012-2h12v16H6a2 2 0 00-2 2" />
        <path d="M8 7h6M8 11h6" />
      </>
    ),
  },
];

export function HomeBenefits() {
  return (
    <section className="wta-block" aria-labelledby="wta-benefits-title">
      <div className="wta-wrap">
        <div className="wta-head">
          <h2 id="wta-benefits-title">Everything you need to move your teaching career forward</h2>
        </div>
        <div className="wta-benefits">
          {BENEFITS.map((b) => (
            <div className="wta-benefits__item" key={b.title}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                {b.icon}
              </svg>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCourses() {
  return (
    <section className="wta-block wta-block--atlas" id="courses" aria-labelledby="wta-courses-title">
      <div className="wta-wrap">
        <div className="wta-head wta-head--center">
          <h2 id="wta-courses-title">Your next chapter starts with free, career-focused training</h2>
          <p>
            Start building practical teaching skills and professional confidence today. Every programme is free,
            and new programmes open on the dates shown.
          </p>
        </div>
        {/* Cards and launch dates come from lib/courses-catalog.ts. */}
        <div className="wta-course-grid">
          {realCourses.map((course) => (
            <div key={course.slug}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Train",
    text: "Free online courses built around real classroom and online-teaching situations.",
  },
  {
    // The LMS has no certificate configured yet; this step deliberately promises
    // completion of the programme, not a specific certificate document.
    title: "Complete your programme",
    text: "Work through every module and the practical tasks that show what you can do.",
  },
  {
    title: "Prepare your career",
    text: "Guidance on your teaching profile, applications and interviews.",
  },
  {
    title: "Explore opportunities",
    text: "We share teaching opportunities and guidance. We don't guarantee placement or employment.",
  },
];

export function HomeHowItWorks() {
  return (
    <section className="wta-block" id="how-it-works" aria-labelledby="wta-how-title">
      <div className="wta-wrap wta-how">
        <div className="wta-how__photo">
          <Image
            src="/assets/img/normal/faq-2-teacher.jpg"
            alt="A teacher at her desk with a laptop and a framed teaching certificate"
            width={768}
            height={1376}
            sizes="(max-width: 1080px) 92vw, 480px"
          />
        </div>
        <div>
          <div className="wta-head wta-head--tight">
            <h2 id="wta-how-title">How your training turns into readiness</h2>
            <p>
              Training, completing a programme, career preparation and job opportunities are four different
              things. Here is what each one means at World Teachers Academy.
            </p>
          </div>
          <ol className="wta-steps">
            {STEPS.map((s) => (
              <li key={s.title}>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function HomeAbout() {
  return (
    <section className="wta-block wta-about" aria-labelledby="wta-about-title">
      <div className="wta-wrap wta-about__grid">
        <div>
          <h2 id="wta-about-title">Your ambition is global. Your preparation should be too.</h2>
          <p>
            Great teaching careers begin with more than qualifications. They begin with preparation, practical
            experience, professional confidence and the courage to pursue opportunities beyond familiar
            boundaries.
          </p>
          <p>
            At World Teachers Academy, career-focused training, teaching resources and professional development
            come together to help you prepare for your next opportunity.
          </p>
          <ul>
            <li>Learn from practical teaching scenarios</li>
            <li>Develop skills employers value</li>
            <li>Prepare for different teaching environments</li>
            <li>Build your professional confidence</li>
          </ul>
          <a className="wta-btn wta-btn--light" href="/about">Learn about us</a>
        </div>
        <div className="wta-about__portrait">
          <Image
            src="/assets/img/normal/more-aboutus-1.jpg"
            alt="A teacher with a laptop, smiling"
            width={1600}
            height={2688}
            sizes="(max-width: 1080px) 92vw, 460px"
          />
          <svg className="wta-about__globe" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <circle cx="100" cy="100" r="90" />
            <ellipse cx="100" cy="100" rx="40" ry="90" />
            <ellipse cx="100" cy="100" rx="75" ry="90" />
            <path d="M10 100h180M22 55h156M22 145h156" />
          </svg>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Do I need teaching experience?",
    a: "No. Our programmes are designed for both new and experienced educators.",
  },
  {
    q: "Are the courses free?",
    a: "Yes. Every programme is currently free. The Professional Online Teaching & Tutoring Certification is open now, and the other programmes open on the dates shown on their cards.",
  },
  {
    q: "Can I enrol in a Coming Soon course?",
    a: "Not yet. Enrolment opens only when a programme is complete and ready. Until then its card shows the planned launch date.",
  },
  {
    q: "Will World Teachers Academy find me a job?",
    a: "We help you prepare, with practical training and guidance on your profile, applications and interviews, and we share teaching opportunities. We don't guarantee placement or employment.",
  },
  {
    q: "How long does a programme take?",
    a: "It depends on the programme. The Online Teaching & Tutoring programme is structured as a 120-hour course that you work through online.",
  },
];

export function HomeFaq() {
  return (
    <section className="wta-block" aria-labelledby="wta-faq-title">
      <div className="wta-wrap wta-faq">
        <div className="wta-head wta-head--tight">
          <h2 id="wta-faq-title">Questions teachers ask us</h2>
          <p>
            Something else on your mind? Email{" "}
            <a href="mailto:hello@worldteachers.academy">hello@worldteachers.academy</a>.
          </p>
        </div>
        <div className="wta-faq__list">
          {FAQS.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCta() {
  const open = realCourses.find((c) => c.status === "open" && c.profileUrl);
  return (
    <section className="wta-cta" aria-labelledby="wta-cta-title">
      <div className="wta-wrap">
        <div className="wta-cta__box">
          <div>
            <h2 id="wta-cta-title">Start free today. Build confidence for tomorrow.</h2>
            <p>Your first course is free and open now.</p>
          </div>
          <a className="wta-btn wta-btn--white" href={open?.profileUrl ?? "#courses"}>
            Start free training
          </a>
        </div>
      </div>
    </section>
  );
}
