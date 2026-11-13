import PageHero from "@/components/layout/PageHero";

import SupportEmailForm from "@/components/support/SupportEmailForm";
import { CONTACT_EMAIL, START_TRAINING_URL } from "@/lib/site";

// Wording proposed for the owner's approval. No response-time promise is made.
const SUPPORT_EMAIL = CONTACT_EMAIL;

const SEND_ICON = (
  <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_support_send)">
      <path
        d="M14.0331 2.03512C12.5811 0.471411 1.65895 4.30197 1.66797 5.7005C1.6782 7.28644 5.93336 7.7743 7.11277 8.10524C7.82203 8.30417 8.01197 8.50817 8.1755 9.2519C8.91617 12.6202 9.28803 14.2955 10.1356 14.3329C11.4865 14.3926 15.4502 3.56117 14.0331 2.03512Z"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7.66797 8.33333L10.0013 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_support_send">
        <rect width="16" height="16" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
);

// Quick answers before emailing.
const topics = [
  { q: "Start the free Online Teaching course", href: START_TRAINING_URL },
  { q: "See when upcoming courses open", href: "/courses" },
  { q: "How the Job Portal works", href: "/faqs" },
  { q: "Teaching abroad: country guides", href: "/countries" },
];

export default function Support() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="How Can We Help?"
        subhead="Questions about a course, your learning account, the Job Portal, or something on the site that isn't working? Email our team and we'll reply by email."
        crumb="Support"
      />

      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row gy-40">
            {/* Contact options */}
            <div className="col-xl-4">
              <div className="th-widget-contact" style={{ background: "#F1F4F9", borderRadius: "16px", padding: "36px 30px", height: "100%" }}>
                <h3 className="widget_title">Contact Us</h3>
                <div className="info-box">
                  <div className="box-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.83203 7.0835L8.28372 8.533C9.71303 9.37808 10.2844 9.37808 11.7137 8.533L14.1654 7.0835" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1.68111 11.2295C1.73559 13.7842 1.76283 15.0614 2.70544 16.0077C3.64804 16.9538 4.95991 16.9868 7.58366 17.0527C9.20072 17.0933 10.8019 17.0933 12.419 17.0527C15.0427 16.9868 16.3546 16.9538 17.2972 16.0077C18.2398 15.0614 18.2671 13.7842 18.3215 11.2295C18.3391 10.4081 18.3391 9.59159 18.3215 8.77017C18.2671 6.21555 18.2398 4.93825 17.2972 3.99205C16.3546 3.04586 15.0427 3.0129 12.419 2.94698C10.8019 2.90635 9.20072 2.90635 7.58365 2.94697C4.95991 3.01289 3.64804 3.04585 2.70543 3.99205C1.76282 4.93824 1.73559 6.21555 1.6811 8.77017C1.66359 9.59159 1.66359 10.4081 1.68111 11.2295Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="box-details">
                    <p className="box-text">Email</p>
                    <p className="box-text">
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="box-link">{SUPPORT_EMAIL}</a>
                    </p>
                  </div>
                </div>
                <div className="info-box">
                  <div className="box-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 5V10L13.3333 11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="box-details">
                    <p className="box-text">How we reply</p>
                    <p className="box-text">By email, to the address you write from. For course questions, please include the course name and the email you enrolled with.</p>
                  </div>
                </div>

                <h3 className="widget_title mt-40">Quick Answers</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    {topics.map((t) => (
                      <li key={t.q}>
                        <a href={t.href}>{t.q}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Message form: opens the visitor's email app (no server storage) */}
            <div className="col-xl-8">
              <div className="contact-form contact-form-4 th_fade_anim" id="contact-sec">
                <SupportEmailForm email={SUPPORT_EMAIL} sendIcon={SEND_ICON} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
