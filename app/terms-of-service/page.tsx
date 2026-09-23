// TODO: LEGAL REVIEW REQUIRED — this page must be reviewed by a qualified
// lawyer before publishing. Several sections below are placeholders ([TBD])
// that need real legal/business input, not invented legal claims — see the
// checklist in the build report for this page.

import PageHero from "@/components/layout/PageHero";
import PolicySection, { type PolicySectionData } from "@/components/legal/PolicySection";

const LAST_UPDATED = "[Date TBD — set to the actual publish date, not the drafting date]";
const TERMS_CONTACT_EMAIL = "[Legal/terms contact email TBD]";

const sections: PolicySectionData[] = [
  {
    heading: "Acceptance of Terms",
    blocks: [
      {
        kind: "text",
        text: "By accessing or using this site, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the site.",
      },
    ],
  },
  {
    heading: "Description of Service",
    blocks: [
      {
        kind: "text",
        text: "World Teachers Academy provides teaching certification courses and a directory of teaching job listings aggregated from third-party sources. World Teachers Academy does not directly employ users of this site and does not guarantee any particular job placement outcome.",
      },
    ],
  },
  {
    heading: "Job Listings Disclaimer",
    blocks: [
      {
        kind: "text",
        text: "Job listings shown on this site are sourced from third parties, including Adzuna and Reed.co.uk. World Teachers Academy does not independently verify every employer listed and is not a party to any employment relationship that results from a listing. Applicants should exercise their own judgment before applying to, or accepting, any position.",
      },
    ],
  },
  {
    heading: "Course Enrollment and Payment Terms",
    blocks: [
      {
        kind: "tbd",
        text: "[TBD — refund policy, payment terms, and access-period specifics need real business input before this section can be written accurately.]",
      },
    ],
  },
  {
    heading: "User Conduct",
    blocks: [
      {
        kind: "text",
        text: "You agree not to use this site for any unlawful purpose, to misrepresent your identity or qualifications when applying to a listing, or to attempt to interfere with the site's normal operation.",
      },
    ],
  },
  {
    heading: "Limitation of Liability",
    blocks: [
      {
        kind: "tbd",
        text: "[TBD — this section specifically needs real legal drafting, not a generic template, given the job-listing aggregation model.]",
      },
    ],
  },
  {
    heading: "Governing Law",
    blocks: [
      {
        kind: "tbd",
        text: "[TBD — confirm whether South African law governs, given the Johannesburg business address.]",
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
            Questions about these Terms can be sent to <strong>{TERMS_CONTACT_EMAIL}</strong>.
          </>
        ),
      },
    ],
  },
];

export default function TermsOfService() {
  return (
    <>
      <PageHero
        eyebrow="Terms of Service"
        title="Terms of Service"
        subhead={`Last updated: ${LAST_UPDATED}`}
        crumb="Terms of Service"
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
