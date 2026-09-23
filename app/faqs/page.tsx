import PageHero from "@/components/layout/PageHero";

// General, site-wide FAQs — distinct from the homepage's certification-focused
// accordion (id="faqAccordion" there), so this uses its own id/anchors.
const faqs = [
  {
    q: "How do I get started?",
    a: "Browse our course catalog, choose a certification that fits your goals, and enroll. Once certified, you can browse verified teaching positions directly through our Job Portal.",
  },
  {
    q: "Do I need previous teaching experience?",
    a: "No — our certification programs are designed for both new and experienced educators.",
  },
  {
    q: "How does the Job Portal work?",
    a: "We list verified teaching positions from multiple sources. Applying requires your name and email so we can connect you with the opportunity — you're then directed to complete your application on the original posting.",
  },
  {
    q: "Are your certifications recognized internationally?",
    a: "Our certification programs follow internationally recognized standards accepted by schools and language institutes. Recognition can vary by country and employer — check our Country Guides for destination-specific details.",
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
