"use client";

import { useMemo, useState } from "react";
import { mockJobs, type Job } from "@/lib/mock-jobs";

const categories: Array<Job["category"] | "All"> = [
  "All",
  "ESL",
  "Primary",
  "Secondary",
  "Special Education",
];

const countries = ["All Countries", ...Array.from(new Set(mockJobs.map((j) => j.country)))];
const employmentTypes: Array<Job["type"] | "All Types"> = ["All Types", "Full-time", "Part-time", "Contract"];

export default function JobPortal() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("All Countries");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [employmentType, setEmploymentType] = useState<(typeof employmentTypes)[number]>("All Types");
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return mockJobs.filter((job) => {
      const matchesKeyword =
        q === "" ||
        job.title.toLowerCase().includes(q) ||
        job.employer.toLowerCase().includes(q) ||
        job.city.toLowerCase().includes(q);
      const matchesCountry = country === "All Countries" || job.country === country;
      const matchesCategory = category === "All" || job.category === category;
      const matchesType = employmentType === "All Types" || job.type === employmentType;
      return matchesKeyword && matchesCountry && matchesCategory && matchesType;
    });
  }, [keyword, country, category, employmentType]);

  // TODO: replace with real counts once live API integration replaces mock data
  const totalPostings = mockJobs.length;
  const totalCountries = new Set(mockJobs.map((j) => j.country)).size;

  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper" data-bg-src="/assets/img/bg/breadcumb-bg.png">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="breadcumb-content">
                <h1 className="breadcumb-title">Teaching Jobs</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Job Portal</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-5 align-self-end d-lg-block d-none">
              <div className="breadcumb-thumb">
                <img src="/assets/img/normal/breadcumb-thumb1-1.png" alt="img" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*==============================
    Stats Banner
============================== */}
      <section className="space-top space-extra-bottom overflow-hidden bg-black">
        <div className="container">
          <div className="sub-title text-theme mb-20 d-inline-block" style={{ letterSpacing: "1px" }}>
            LIVE TEACHING POSITIONS
          </div>
          <h2 className="text-white mb-20" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
            Active Teaching Positions, Verified
          </h2>
          <p className="mb-40" style={{ color: "var(--paper-dim-color, #9AA4C0)", maxWidth: "760px" }}>
            Teaching positions pulled from verified job sources, with direct application links.
          </p>
          <div className="row gy-4">
            <div className="col-6 col-md-3">
              <div className="counter-card">
                <div className="media-body">
                  <h2 className="box-number text-white">{totalPostings}</h2>
                  <p className="box-text" style={{ color: "var(--paper-dim-color, #9AA4C0)" }}>Total Live Positions</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="counter-card">
                <div className="media-body">
                  <h2 className="box-number text-white">{totalCountries}</h2>
                  <p className="box-text" style={{ color: "var(--paper-dim-color, #9AA4C0)" }}>Countries Covered</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="counter-card">
                <div className="media-body">
                  <h2 className="box-number text-white" style={{ fontSize: "22px" }}>Original Posting</h2>
                  <p className="box-text" style={{ color: "var(--paper-dim-color, #9AA4C0)" }}>Application Type</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="counter-card">
                <div className="media-body">
                  <h2 className="box-number text-white" style={{ fontSize: "22px" }}>Regularly</h2>
                  <p className="box-text" style={{ color: "var(--paper-dim-color, #9AA4C0)" }}>Updated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*==============================
    Job Search + Filters
============================== */}
      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="header-search-form mb-40">
            <form className="search-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <i className="far fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by job title, school, or city"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <button className="th-btn" type="submit">
                FIND JOBS
                <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5"></path>
                </svg>
              </button>
            </form>
          </div>

          <div className="row gy-3 align-items-center justify-content-between mb-10">
            <div className="col-md-4">
              <div className="form-group style-border3 mb-0">
                <select
                  className="form-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  aria-label="Filter by country"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <i className="fal fa-globe"></i>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group style-border3 mb-0">
                <select
                  className="form-select"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as (typeof employmentTypes)[number])}
                  aria-label="Filter by employment type"
                >
                  {employmentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <i className="fal fa-briefcase"></i>
              </div>
            </div>
            <div className="col-md-auto">
              <div className="btn-wrap flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="th-btn btn-sm style-border2"
                    style={
                      category === cat
                        ? { background: "#0D9488", color: "var(--white-color)", borderColor: "#0D9488" }
                        : undefined
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mb-0 text-body">
            Showing {filteredJobs.length} verified teaching position{filteredJobs.length === 1 ? "" : "s"}
            {country !== "All Countries" ? ` in ${country}` : ""}
            {/* TODO: replace mockJobs with real job-source API data (Adzuna, per project scope) */}
          </p>
        </div>
      </section>

      {country !== "All Countries" && <CountryLegalPanel country={country} />}

      {/*==============================
    Job Listings
============================== */}
      <section className="space-bottom overflow-hidden">
        <div className="container">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-60">
              <p className="mb-0">No listings match your search — try adjusting the filters.</p>
            </div>
          ) : (
            <div className="row gy-4">
              {filteredJobs.map((job) => (
                <div className="col-12" key={job.id}>
                  <div className="event-card2 th_fade_anim">
                    <div className="box-img">
                      <div className="thumb">
                        <img src={job.image} alt={job.title} />
                      </div>
                      <span className="box-date" data-theme-color="#14B8A6">
                        <span style={{ fontSize: "11px", lineHeight: 1.2 }}>{job.type}</span>
                      </span>
                    </div>
                    <div className="box-content">
                      <h3 className="box-title">{job.title}</h3>
                      <div className="event-meta-wrap">
                        <span className="event-meta"><i className="fas fa-map-marker-alt"></i>{job.city}, {job.country}</span>
                        <span className="event-meta"><i className="fas fa-clock"></i>{job.type}</span>
                      </div>
                      <div className="event-speaker-wrap">
                        <div className="box-thumb">
                          <img src="/assets/img/event/event-thumb1-1.jpg" alt="img" />
                        </div>
                        <div className="event-speaker-details">
                          <h4 className="speaker-name">{job.employer}</h4>
                          <p className="speaker-desig">{job.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="btn-wrap">
                      <button type="button" className="th-btn style10 btn-md" onClick={() => setApplyJob(job)}>
                        APPLY
                        <svg className="ms-2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.99997 1.41455C7.99997 2.11075 8.68991 3.15255 9.38737 4.02748C10.2855 5.15395 11.3574 6.13802 12.5873 6.88935C13.5087 7.45195 14.6276 7.99202 15.5264 7.99202M7.99997 14.5858C7.99997 13.8896 8.68991 12.8477 9.38737 11.9728C10.2855 10.8464 11.3574 9.86228 12.5873 9.11095C13.5087 8.54835 14.6276 8.00828 15.5264 8.00828M15.5264 8.00015H0.473572" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
    </>
  );
}

// TODO: LEGAL CONTENT — every field in this panel must be sourced from an
// official government immigration site or a qualified source before this
// ships to production. The placeholder text below is intentionally
// obviously-fake (not plausible-sounding invented visa/legal content) so it
// cannot be mistaken for real guidance if it accidentally ships as-is.
const LEGAL_PLACEHOLDER =
  "[LEGAL INFO PENDING VERIFICATION — DO NOT PUBLISH UNTIL SOURCED FROM AN OFFICIAL GOVERNMENT/IMMIGRATION SOURCE]";

function CountryLegalPanel({ country }: { country: string }) {
  return (
    <section className="space-extra-bottom overflow-hidden">
      <div className="container">
        <div className="event-card2" style={{ padding: "30px" }}>
          <h3 className="box-title mb-20">{country} — Visa &amp; Legal Overview</h3>
          <div className="row gy-4">
            <div className="col-md-4">
              <h4 style={{ fontSize: "16px" }}>Legal Gateway</h4>
              <p className="mb-0 text-body">{LEGAL_PLACEHOLDER}</p>
            </div>
            <div className="col-md-4">
              <h4 style={{ fontSize: "16px" }}>Compensation Range</h4>
              <p className="mb-0 text-body">{LEGAL_PLACEHOLDER}</p>
            </div>
            <div className="col-md-4">
              <h4 style={{ fontSize: "16px" }}>Work Permit Requirements</h4>
              <p className="mb-0 text-body">{LEGAL_PLACEHOLDER}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    // TODO: wire to Supabase leads table + real apply_url redirect
    console.log("Job application lead captured:", {
      jobId: job.id,
      jobTitle: job.title,
      employer: job.employer,
      name,
      email,
      consent,
    });

    setSubmitted(true);
  }

  return (
    <>
      <div
        className="modal-backdrop show"
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        onClick={onClose}
      />
      <div
        className="modal show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content" style={{ borderRadius: "16px", padding: "10px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: "22px", margin: 0 }}>
                {submitted ? "Application Received" : `Apply — ${job.title}`}
              </h3>
              <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
                <i className="far fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {submitted ? (
                <p className="mb-0">
                  Thanks! Redirecting you to the job posting...
                </p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="mb-30">
                    {job.employer} — {job.city}, {job.country}
                  </p>
                  <div className="form-group style-border3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group style-border3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-check mb-30" style={{ paddingLeft: "1.6em" }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="apply-consent"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        if (e.target.checked) setConsentError(false);
                      }}
                    />
                    <label className="form-check-label" htmlFor="apply-consent">
                      I agree to be contacted about this and similar teaching opportunities.
                    </label>
                  </div>
                  {consentError && (
                    <p className="mb-20" style={{ color: "#E01717" }}>
                      Please agree to be contacted before submitting.
                    </p>
                  )}
                  <button type="submit" className="th-btn style5 w-100">
                    SUBMIT APPLICATION
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
