// TODO: LEGAL REVIEW REQUIRED — this page must be reviewed by a qualified
// lawyer, particularly given POPIA (South Africa) and potential GDPR
// exposure from EU users, before publishing. Several sections below are
// placeholders ([TBD]) that need real legal/business input, not invented
// legal claims — see the checklist in the build report for this page.

import PageHero from "@/components/layout/PageHero";
import PolicySection, { type PolicySectionData } from "@/components/legal/PolicySection";

const LAST_UPDATED = "[Date TBD — set to the actual publish date, not the drafting date]";
const PRIVACY_CONTACT_EMAIL = "[Privacy contact email TBD]";
const BUSINESS_ADDRESS = "[Full business address TBD] — Johannesburg, South Africa";

const sections: PolicySectionData[] = [
  {
    heading: "What Information We Collect",
    blocks: [
      {
        kind: "list",
        items: [
          "Your name, email address, and consent status when you apply to a job listing through our Job Portal.",
          "Any information you submit via our contact or support forms (e.g. your name, email, and message).",
        ],
      },
      {
        kind: "tbd",
        text: "[TBD — confirm whether the homepage newsletter/subscribe form is actually active and collecting email addresses; if so, list that collection here explicitly.]",
      },
    ],
  },
  {
    heading: "How We Use It",
    blocks: [
      {
        kind: "list",
        items: [
          "To facilitate job applications submitted through the Job Portal.",
          "To respond to support and contact-form inquiries.",
        ],
      },
      {
        kind: "tbd",
        text: "[TBD — confirm if newsletter emails are actually sent, and describe that use here if so.]",
      },
    ],
  },
  {
    heading: "Third Parties",
    blocks: [
      {
        kind: "text",
        text: "Job listing data shown on this site is sourced from Adzuna and Reed.co.uk. We do not share the personal information you submit with any other third party beyond what is described in this policy.",
      },
    ],
  },
  {
    heading: "Data Storage",
    blocks: [
      {
        kind: "text",
        text: "Data is stored using Supabase (PostgreSQL) with row-level security.",
      },
      {
        kind: "tbd",
        text: "[Data retention period TBD — confirm with the business before publishing.]",
      },
    ],
  },
  {
    heading: "Your Rights",
    blocks: [
      {
        kind: "tbd",
        text: "[TBD — this section needs real legal input, particularly for POPIA compliance given the South African business address, and GDPR given the site serves teachers relocating to/from EU countries.]",
      },
    ],
  },
  {
    heading: "Contact",
    blocks: [
      {
        kind: "text",
        text: (
          <>
            Questions about this policy can be sent to <strong>{PRIVACY_CONTACT_EMAIL}</strong>, or by mail to{" "}
            <strong>{BUSINESS_ADDRESS}</strong>.
          </>
        ),
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <PageHero
        eyebrow="Privacy Policy"
        title="Privacy Policy"
        subhead={`Last updated: ${LAST_UPDATED}`}
        crumb="Privacy Policy"
      />

      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              {sections.map((section, i) => (
                <PolicySection section={section} index={i + 1} key={section.heading} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
