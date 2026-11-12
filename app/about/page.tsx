import PageHero from "@/components/layout/PageHero";
import { START_TRAINING_URL } from "@/lib/site";

const RIGHT_ARROW = (
  <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const CHECK_ICON = (
  <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.75 10.1252C0.75 10.1252 2.625 10.1252 5.125 14.5002C5.125 14.5002 12.0735 3.04191 18.25 0.750244"
      stroke="#1E1E1E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const whatWeDo = [
  {
    title: "Practical Teacher Training",
    text: "Online teaching, TEFL and specialist programmes built around real classroom situations, not generic online-course filler. Every programme is currently free.",
  },
  {
    title: "Job Portal",
    text: "Teaching vacancies gathered from public job listings in many countries, with links to apply directly with the employer.",
  },
  {
    title: "Country Guides",
    text: "Honest, detailed guides on what teaching abroad actually looks like — culture, visas, and daily life — for the destinations our teachers actually go to.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Built by People Who've Actually Taught"
        subhead="World Teachers Academy helps aspiring and experienced educators build practical teaching skills, professional confidence and career readiness — and prepare for teaching opportunities around the world."
        crumb="About Us"
      />

      {/*==============================
Our Story
==============================*/}
      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div className="title-area text-center mb-30">
                <span className="sub-title text-theme th_fade_anim">
                  <img src="/assets/img/icon/subtitle-icon1-6.svg" alt="" />
                  Our Story
                </span>
                <h2 className="sec-title th_fade_anim">
                  <span className="th-text-perspective">Why We Started This</span>
                </h2>
              </div>
              <p style={{ fontSize: "18px", color: "#374151", lineHeight: 1.7, textAlign: "center" }}>
                Most teaching-certification platforms stop at the certificate. We didn&apos;t think that was good
                enough. A certificate on its own doesn&apos;t prepare you for a real classroom, an interview or life
                in a new country. So we bring the pieces together in one place: practical training taught by people
                who&apos;ve stood in front of a classroom, honest country guides, and access to teaching
                opportunities. We don&apos;t promise jobs — we help you become the teacher schools are looking
                for, and prepare you to take your next step with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*==============================
What We Do
==============================*/}
      <section className="space-bottom overflow-hidden bg-smoke">
        <div className="container space-top">
          <div className="title-area text-center mb-50">
            <span className="sub-title text-theme th_fade_anim">
              <img src="/assets/img/icon/subtitle-icon1-6.svg" alt="" />
              What We Do
            </span>
            <h2 className="sec-title th_fade_anim">
              <span className="th-text-perspective">Three Pieces, One Career Path</span>
            </h2>
          </div>
          <div className="row gy-4 justify-content-center">
            {whatWeDo.map((card) => (
              <div className="col-xl-4 col-md-6 d-flex th_fade_anim" key={card.title}>
                <div className="about-info-wrap11" style={{ background: "#fff" }}>
                  <div className="box-icon">{CHECK_ICON}</div>
                  <div className="box-details">
                    <h3 className="box-title">{card.title}</h3>
                    <p className="box-text">{card.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*==============================
Our Approach
==============================*/}
      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div className="title-area text-center mb-30">
                <span className="sub-title text-theme th_fade_anim">
                  <img src="/assets/img/icon/subtitle-icon1-6.svg" alt="" />
                  Our Approach
                </span>
                <h2 className="sec-title th_fade_anim">
                  <span className="th-text-perspective">Built By Educators, Not Just Marketers</span>
                </h2>
              </div>
              <p style={{ fontSize: "18px", color: "#374151", lineHeight: 1.7, textAlign: "center" }}>
                Every certification program is shaped by people who&apos;ve actually taught — not just written
                about teaching. We&apos;d rather tell you the honest, sometimes complicated reality of teaching
                abroad (visa realities, cost-of-living tradeoffs, cultural adjustment) than oversell an easy
                fantasy. That&apos;s the same standard behind our Country Guides, our courses, and every job
                listing we surface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*==============================
Cta Area
==============================*/}
      <section className="pt-80 pb-80 bg-theme overflow-hidden" data-bg-src="/assets/img/bg/cta-bg5-1.png">
        <div className="container">
          <div className="row gy-40 justify-content-between align-items-center">
            <div className="col-xxl-6 col-xl-7 col-lg-7">
              <div className="title-area mb-0 text-lg-start text-center">
                <h2 className="sec-title text-white">Ready to start?</h2>
                <p className="text-white mb-0 mt-30">
                  Start our free Professional Online Teaching &amp; Tutoring Certification today, or explore what
                  teaching looks like in the countries you&apos;re considering.
                </p>
              </div>
            </div>
            <div className="col-lg-auto">
              <div className="btn-wrap justify-content-center flex-wrap">
                <a href={START_TRAINING_URL} className="th-btn style5">
                  START FREE TRAINING{RIGHT_ARROW}
                </a>
                <a href="/countries" className="th-btn style2">
                  EXPLORE COUNTRY GUIDES{RIGHT_ARROW}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
