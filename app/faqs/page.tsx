import PageHero from "@/components/layout/PageHero";

// General, site-wide FAQs — distinct from the homepage's certification-focused
// accordion (id="faqAccordion" there), so this uses its own id/anchors.
const faqs = [
  {
    q: "How do I get started?",
    a: "Start with our free Professional Online Teaching & Tutoring Certification — it's open now. Our other programmes open on the dates shown on the Courses page. Along the way, use our Country Guides and Resources to prepare for teaching abroad.",
  },
  {
    q: "Do I need previous teaching experience?",
    a: "No — our programmes are designed for both new and experienced educators.",
  },
  // The next three match the owner-approved homepage FAQ (13 Nov 2026, B6).
  {
    q: "Will you help me find a job?",
    a: "We provide Country Guides and career resources to help you explore international employment opportunities. Our updated Job Portal is being developed to make discovering opportunities easier. We do not guarantee employment or placement.",
  },
  {
    q: "Will my qualification be recognised abroad?",
    a: "Recognition of qualifications varies by country and by employer. Our Country Guides explain what each destination typically asks for, so check those requirements before you apply.",
  },
  {
    q: "Do you arrange visas, work permits or relocation?",
    a: "World Teachers Academy provides educational resources and career guidance. We do not arrange or guarantee visas, work permits, employment or relocation.",
  },
  {
    q: "How do I contact support?",
    a: (
      <>
        Visit our <a href="/support">Support</a> page for contact details and common help topics.
      </>
    ),
  },
  {
    q: "Where can I find country-specific information before applying abroad?",
    a: (
      <>
        Check our <a href="/countries">Country Guides</a> — each one covers culture, visas, cost of living, and
        what teaching there is actually like.
      </>
    ),
  },
];

export default function Faqs() {
  return (
    <>
      <PageHero
        eyebrow="FAQs"
        title="Frequently Asked Questions"
        subhead="General questions about how World Teachers Academy works — for course-specific questions, see each course's own details page."
        crumb="FAQs"
      />

      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div className="accordion" id="siteFaqAccordion">
                {faqs.map((item, i) => (
                  <div className="accordion-card style2 th_fade_anim" key={item.q}>
                    <div className="accordion-header" id={`site-collapse-item-${i}`}>
                      <button
                        className={`accordion-button${i === 0 ? "" : " collapsed"}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#site-collapse-${i}`}
                        aria-expanded={i === 0}
                        aria-controls={`site-collapse-${i}`}
                      >
                        {item.q}
                      </button>
                    </div>
                    <div
                      id={`site-collapse-${i}`}
                      className={`accordion-collapse collapse${i === 0 ? " show" : ""}`}
                      data-bs-parent="#siteFaqAccordion"
                    >
                      <div className="accordion-body">
                        <p className="faq-text">{item.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
