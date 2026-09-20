"use client";

import { useEffect, useMemo, useState } from "react";
import { getDescriptionSnippet } from "@/lib/html-text";

export interface Job {
  id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  country: string; // ISO country code, e.g. "ZA"
  city: string | null;
  employment_type: "full_time" | "part_time" | "contract" | "unspecified";
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  apply_url: string;
  posted_at: string | null;
}

const COUNTRY_NAMES: Record<string, string> = {
  ZA: "South Africa",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  SG: "Singapore",
  IN: "India",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
};

const EMPLOYMENT_TYPE_LABELS: Record<Job["employment_type"], string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  unspecified: "Unspecified",
};

const EMPLOYMENT_TYPE_FILTERS: Array<Job["employment_type"] | "all"> = [
  "all",
  "full_time",
  "part_time",
  "contract",
  "unspecified",
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  ZAR: "R",
  GBP: "£",
  USD: "$",
  CAD: "$",
  AUD: "$",
  SGD: "$",
  INR: "₹",
  EUR: "€",
};

const INDIGO = "#4F46E5";
const ORANGE = "#F97316";
const TEAL = "#14B8A6";
const INK_NAVY = "#0F172A";
const PAPER_DIM = "#9AA4C0";
const BORDER = "#E2E5EE";

function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  );
}

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

// Real ingested data: salary_min is frequently 0 while salary_max carries the
// real figure (Adzuna's predicted-low-end placeholder), and min often equals
// max (single quoted figure rather than a true range) — both handled below.
function formatSalary(job: Job): string | null {
  const { salary_min, salary_max, currency } = job;
  if (salary_min == null && salary_max == null) return null;
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? `${currency} `) : "";

  if (salary_min != null && salary_max != null) {
    if (salary_min === salary_max) return `${symbol}${formatAmount(salary_min)}`;
    if (salary_min === 0) return `Up to ${symbol}${formatAmount(salary_max)}`;
    return `${symbol}${formatAmount(salary_min)}–${symbol}${formatAmount(salary_max)}`;
  }
  const only = (salary_min ?? salary_max)!;
  return `${symbol}${formatAmount(only)}`;
}

function formatRelativeDate(iso: string | null): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

export default function JobPortal() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("all");
  const [employmentType, setEmploymentType] = useState<Job["employment_type"] | "all">("all");
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [totalLive, setTotalLive] = useState<number | null>(null);

  const [headerHeight, setHeaderHeight] = useState(96);

  // Deep link from the country guides: /job-portal?country=AR preselects the
  // country filter. Read on mount (not useSearchParams) to keep this page free
  // of a Suspense boundary.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("country");
    if (code && /^[A-Za-z]{2}$/.test(code)) setCountry(code.toUpperCase());
  }, []);

  // The shared site <Header/> switches to position:fixed after a scroll
  // threshold (vendor `.sticky-wrapper.sticky` behavior in main.js) — this
  // page's own sticky filter bar needs to stick just below it, so it tracks
  // the header's real rendered height rather than a guessed constant.
  useEffect(() => {
    const headerEl = document.querySelector<HTMLElement>(".th-header");
    if (!headerEl) return;
    const update = () => setHeaderHeight(headerEl.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerEl);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Global stats (unfiltered) — fetched once, independent of the filters
  // below, so "500 live positions across 10 countries" always reflects the
  // whole dataset rather than the current filtered view.
  useEffect(() => {
    fetch("/api/jobs/countries")
      .then((res) => res.json())
      .then((data) => {
        setAvailableCountries(data.countries ?? []);
        setTotalLive(typeof data.total === "number" ? data.total : null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (country !== "all") params.set("country", country);
    if (employmentType !== "all") params.set("employment_type", employmentType);
    if (keyword.trim()) params.set("keyword", keyword.trim());

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/jobs?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setJobs(data.jobs ?? []))
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [country, employmentType, keyword]);

  const countryOptions = useMemo(
    () => availableCountries.map((code) => ({ code, name: COUNTRY_NAMES[code] ?? code })),
    [availableCountries]
  );

  const activeFilterCount = [country !== "all", employmentType !== "all", keyword.trim() !== ""].filter(
    Boolean
  ).length;

  const filterControls = (
    <FilterControls
      keyword={keyword}
      setKeyword={setKeyword}
      country={country}
      setCountry={setCountry}
      employmentType={employmentType}
      setEmploymentType={setEmploymentType}
      countryOptions={countryOptions}
    />
  );

  return (
    <>
      <img
        src="/assets/Jobportal%20hero%20section.jpg"
        alt="World Teachers Academy Job Portal"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      {/*==============================
    Sticky Filter Bar
============================== */}
      <div
        style={{
          position: "sticky",
          top: headerHeight,
          zIndex: 40,
          background: "#fff",
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div className="container" style={{ paddingTop: "14px", paddingBottom: "14px" }}>
          <div
            className="d-none d-lg-flex"
            style={{ gap: "12px", alignItems: "center", flexWrap: "wrap" }}
          >
            {filterControls}
          </div>

          {/* Mobile trigger */}
          <div className="d-flex d-lg-none align-items-center justify-content-between">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="th-btn style-border2 btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <i className="fal fa-sliders-h"></i>
              Filters
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: INDIGO,
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "11px",
                    lineHeight: 1,
                    padding: "3px 7px",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Status line: global context (left) + current filtered count (right) */}
          <div
            className="d-flex justify-content-between flex-wrap"
            style={{ marginTop: "10px", fontSize: "13px", color: PAPER_DIM, gap: "6px" }}
          >
            <span>
              {totalLive !== null
                ? `${totalLive} live position${totalLive === 1 ? "" : "s"} across ${countryOptions.length} countr${
                    countryOptions.length === 1 ? "y" : "ies"
                  }`
                : "Loading live positions..."}
            </span>
            <span style={{ fontWeight: 600, color: INK_NAVY }}>
              {loading ? "Updating..." : `Showing ${jobs.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <>
          <div
            onClick={() => setMobileFiltersOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1050 }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1051,
              background: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "20px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 -8px 30px rgba(15,23,42,0.15)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-20">
              <h3 style={{ fontSize: "18px", margin: 0, color: INK_NAVY }}>Filters</h3>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <i className="far fa-times"></i>
              </button>
            </div>
            <div className="d-flex flex-column" style={{ gap: "14px" }}>
              {filterControls}
            </div>
            <button
              type="button"
              className="th-btn w-100 mt-20"
              style={{ background: INDIGO, borderColor: INDIGO }}
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {loading ? "..." : jobs.length} Results
            </button>
          </div>
        </>
      )}

      {country !== "all" && <CountryLegalPanel country={COUNTRY_NAMES[country] ?? country} />}

      {/*==============================
    Job Listings
============================== */}
      <section style={{ paddingTop: "24px", paddingBottom: "60px" }}>
        <div className="container">
          {!loading && jobs.length === 0 ? (
            <div className="text-center" style={{ padding: "60px 0", color: PAPER_DIM }}>
              <p className="mb-0">No listings match your search — try adjusting the filters.</p>
            </div>
          ) : (
            <div className="d-flex flex-column" style={{ gap: "10px" }}>
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} onApply={() => setApplyJob(job)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
    </>
  );
}

function FilterControls({
  keyword,
  setKeyword,
  country,
  setCountry,
  employmentType,
  setEmploymentType,
  countryOptions,
}: {
  keyword: string;
  setKeyword: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  employmentType: Job["employment_type"] | "all";
  setEmploymentType: (v: Job["employment_type"] | "all") => void;
  countryOptions: Array<{ code: string; name: string }>;
}) {
  const selectStyle = (active: boolean): React.CSSProperties => ({
    borderColor: active ? INDIGO : BORDER,
    color: active ? INDIGO : INK_NAVY,
    fontWeight: active ? 600 : 400,
  });

  return (
    <>
      <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
        <div className="form-group style-border3 mb-0" style={{ position: "relative" }}>
          <i
            className="far fa-search"
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              right: "auto",
              color: PAPER_DIM,
              pointerEvents: "none",
            }}
          ></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by job title, school, or city"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </div>
      <div style={{ flex: "0 1 200px", minWidth: "170px" }}>
        <select
          className="form-select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          aria-label="Filter by country"
          style={selectStyle(country !== "all")}
        >
          <option value="all">All Countries</option>
          {countryOptions.map(({ code, name }) => (
            <option key={code} value={code}>
              {countryFlag(code)} {name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: "0 1 170px", minWidth: "150px" }}>
        <select
          className="form-select"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value as Job["employment_type"] | "all")}
          aria-label="Filter by employment type"
          style={selectStyle(employmentType !== "all")}
        >
          {EMPLOYMENT_TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : EMPLOYMENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function JobRow({ job, onApply }: { job: Job; onApply: () => void }) {
  const salary = formatSalary(job);
  const posted = formatRelativeDate(job.posted_at);
  const snippet = getDescriptionSnippet(job.description);

  return (
    <div
      className="th_fade_anim"
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        background: "#fff",
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <h3 style={{ fontSize: "16px", margin: "0 0 4px", color: INK_NAVY, fontWeight: 700 }}>
          {job.title}
        </h3>
        <div style={{ fontSize: "13px", color: PAPER_DIM, display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <span>{job.company_name ?? "Confidential Employer"}</span>
          <span>
            {countryFlag(job.country)} {job.city ? `${job.city}, ` : ""}
            {COUNTRY_NAMES[job.country] ?? job.country}
          </span>
          {posted && <span>{posted}</span>}
        </div>
        {snippet && (
          <p style={{ fontSize: "13px", color: PAPER_DIM, margin: "6px 0 0", lineHeight: 1.4 }}>
            {snippet}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: TEAL,
            background: "rgba(20, 184, 166, 0.1)",
            padding: "4px 10px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
          }}
        >
          {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
        </span>

        {salary && (
          <span style={{ fontSize: "13px", fontWeight: 600, color: INK_NAVY, whiteSpace: "nowrap" }}>
            {salary}
          </span>
        )}

        <button
          type="button"
          className="th-btn btn-sm"
          style={{ background: ORANGE, borderColor: ORANGE, whiteSpace: "nowrap" }}
          onClick={onApply}
        >
          View Job
        </button>
      </div>
    </div>
  );
}

// TODO: LEGAL CONTENT — every field in this panel must be sourced from an
// official government immigration site or a qualified source before this
// ships to production. The placeholder text below is intentionally
// obviously-fake (not plausible-sounding invented visa/legal content) so it
// cannot be mistaken for real guidance if it accidentally ships as-is.
const LEGAL_PLACEHOLDER = "[Legal & compensation info pending verification for this country]";

function CountryLegalPanel({ country }: { country: string }) {
  return (
    <div className="container" style={{ marginTop: "16px" }}>
      <div
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: "10px",
          padding: "14px 18px",
          background: "#FAFBFF",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px 28px",
          fontSize: "13px",
        }}
      >
        <strong style={{ color: INK_NAVY, flex: "1 1 100%" }}>{country} — Visa &amp; Legal Overview</strong>
        <span style={{ color: PAPER_DIM }}>
          <strong style={{ color: INK_NAVY }}>Legal gateway: </strong>
          {LEGAL_PLACEHOLDER}
        </span>
        <span style={{ color: PAPER_DIM }}>
          <strong style={{ color: INK_NAVY }}>Compensation range: </strong>
          {LEGAL_PLACEHOLDER}
        </span>
        <span style={{ color: PAPER_DIM }}>
          <strong style={{ color: INK_NAVY }}>Work permit: </strong>
          {LEGAL_PLACEHOLDER}
        </span>
      </div>
    </div>
  );
}

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          job_id: job.id,
          consent_given: consent,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      const redirectUrl = data.apply_url ?? job.apply_url;
      window.location.href = redirectUrl;
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1050 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1055,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "440px",
            padding: "24px",
          }}
        >
          <div className="d-flex justify-content-between align-items-start mb-20">
            <div>
              <h3 style={{ fontSize: "18px", margin: 0, color: INK_NAVY }}>
                {submitted ? "Application Received" : "Apply for this role"}
              </h3>
              {!submitted && (
                <p style={{ fontSize: "13px", color: PAPER_DIM, margin: "4px 0 0" }}>{job.title}</p>
              )}
            </div>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
              <i className="far fa-times"></i>
            </button>
          </div>

          {submitted ? (
            <p className="mb-0" style={{ fontSize: "14px", color: INK_NAVY }}>
              Thanks! Redirecting you to the job posting...
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: "13px", color: PAPER_DIM, marginBottom: "18px" }}>
                {job.company_name ?? "Confidential Employer"} &mdash; {job.city ? `${job.city}, ` : ""}
                {COUNTRY_NAMES[job.country] ?? job.country}
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
              <div className="form-check mb-20" style={{ paddingLeft: "1.6em" }}>
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
                <label className="form-check-label" htmlFor="apply-consent" style={{ fontSize: "13px" }}>
                  I agree to be contacted about this and similar teaching opportunities.
                </label>
              </div>
              {consentError && (
                <p style={{ color: "#E01717", fontSize: "13px", marginBottom: "16px" }}>
                  Please agree to be contacted before submitting.
                </p>
              )}
              {submitError && (
                <p style={{ color: "#E01717", fontSize: "13px", marginBottom: "16px" }}>
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                className="th-btn w-100"
                style={{ background: ORANGE, borderColor: ORANGE }}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
