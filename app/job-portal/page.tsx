"use client";

import { useEffect, useMemo, useState } from "react";
import { getDescriptionSnippet } from "@/lib/html-text";
import CountryFlag from "@/components/layout/CountryFlag";
import CountrySelector, { type CountryOption } from "@/components/jobs/CountrySelector";
import { FLAGS } from "@/lib/flags";
import { COUNTRY_GUIDES } from "@/lib/country-guides-index";
import { formatSalary } from "@/lib/job-salary";
import { JobTrustDetails, JobTrustLine, ReportJob } from "@/components/jobs/JobTrust";
import type { TrustFields } from "@/lib/job-trust";

// Fields marked optional exist only after docs/proposals/2026-11-job-verification.sql
// is applied; the page works with or without them.
export interface Job extends TrustFields {
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
  salary_period?: "year" | "month" | "week" | "day" | "hour" | null;
  salary_is_predicted?: boolean | null;
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

// Full visitor-facing country name for an ISO code.
function countryName(code: string): string {
  return FLAGS[code]?.name ?? COUNTRY_NAMES[code] ?? code;
}

// "Melbourne, Australia" — without repeating the country when the feed's
// location already ends with it ("Western Australia, Australia").
function placeLabel(city: string | null, code: string): string {
  const name = countryName(code);
  if (!city) return name;
  const c = city.trim();
  if (c.toLowerCase() === name.toLowerCase() || c.toLowerCase().endsWith(`, ${name.toLowerCase()}`)) return c;
  return `${c}, ${name}`;
}

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


const INDIGO = "#4F46E5";
const ORANGE = "#F97316";
const TEAL = "#14B8A6";
const INK_NAVY = "#0F172A";
const PAPER_DIM = "#9AA4C0";
const BORDER = "#E2E5EE";
const JOBS_PAGE_SIZE = 10;

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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>({});
  const [countriesLoaded, setCountriesLoaded] = useState(false);
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
        setCountryCounts(data.counts ?? {});
        setTotalLive(typeof data.total === "number" ? data.total : null);
      })
      .catch(() => {})
      .finally(() => setCountriesLoaded(true));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (country !== "all") params.set("country", country);
    if (employmentType !== "all") params.set("employment_type", employmentType);
    if (keyword.trim()) params.set("keyword", keyword.trim());
    params.set("page", String(page));

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/jobs?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setJobs(data.jobs ?? []);
          setTotalPages(typeof data.total_pages === "number" ? data.total_pages : 1);
          setTotalResults(typeof data.total === "number" ? data.total : (data.jobs ?? []).length);
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [country, employmentType, keyword, page]);

  function goToPage(next: number) {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped === page) return;
    setPage(clamped);
    const section = document.getElementById("job-portal-listings");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // A filter change resets to page 1 rather than staying on a page that may
  // no longer exist for the new result set.
  function handleKeywordChange(value: string) {
    setKeyword(value);
    setPage(1);
  }
  function handleCountryChange(value: string) {
    setCountry(value);
    setPage(1);
    // Keep the choice in the address bar, so it can be shared or bookmarked
    // and the browser's back button returns to it.
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("country");
    else url.searchParams.set("country", value);
    window.history.replaceState(null, "", url.toString());
  }
  function handleEmploymentTypeChange(value: Job["employment_type"] | "all") {
    setEmploymentType(value);
    setPage(1);
  }

  const countryOptions = useMemo<CountryOption[]>(
    () =>
      availableCountries
        .map((code) => ({ code, name: countryName(code), count: countryCounts[code] ?? 0 }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [availableCountries, countryCounts]
  );
  // Countries we have a guide for but no current openings: listed separately
  // in the selector so they stay discoverable but clearly marked. A country
  // arriving by link that is in neither list is added here too, so the
  // selector shows it rather than "All countries".
  const noJobCountries = useMemo<CountryOption[]>(() => {
    const codes = new Set(Object.keys(COUNTRY_GUIDES));
    if (country !== "all") codes.add(country);
    return [...codes]
      .filter((c) => !countryCounts[c] && (FLAGS[c] || c === country))
      .map((code) => ({ code, name: countryName(code), count: 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countryCounts, country]);

  const activeFilterCount = [country !== "all", employmentType !== "all", keyword.trim() !== ""].filter(
    Boolean
  ).length;

  const filterControls = (variant: "popover" | "inline") => (
    <FilterControls
      variant={variant}
      noJobCountries={noJobCountries}
      totalLive={totalLive}
      keyword={keyword}
      setKeyword={handleKeywordChange}
      country={country}
      setCountry={handleCountryChange}
      employmentType={employmentType}
      setEmploymentType={handleEmploymentTypeChange}
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
            {filterControls("popover")}
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
                ? `${totalLive} teaching position${totalLive === 1 ? "" : "s"} across ${countryOptions.length} countr${
                    countryOptions.length === 1 ? "y" : "ies"
                  }`
                : "Loading live positions..."}
            </span>
            <span style={{ fontWeight: 600, color: INK_NAVY }}>
              {loading
                ? "Updating..."
                : totalResults === 0
                  ? "Showing 0"
                  : `Showing ${(page - 1) * JOBS_PAGE_SIZE + 1}–${Math.min(page * JOBS_PAGE_SIZE, totalResults)} of ${totalResults}`}
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
              {filterControls("inline")}
            </div>
            <button
              type="button"
              className="th-btn w-100 mt-20"
              style={{ background: INDIGO, borderColor: INDIGO }}
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {loading ? "..." : totalResults} Result{totalResults === 1 ? "" : "s"}
            </button>
          </div>
        </>
      )}

      {country !== "all" && <CountryNote code={country} />}

      {/*==============================
    Job Listings
============================== */}
      <section id="job-portal-listings" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
        <div className="container">
          {!loading && jobs.length === 0 ? (
            country !== "all" && countriesLoaded && !countryCounts[country] ? (
              <NoOpenings code={country} onExploreAll={() => handleCountryChange("all")} />
            ) : (
              <div className="text-center" style={{ padding: "60px 0", color: PAPER_DIM }}>
                <p className="mb-0">No listings match your search — try adjusting the filters.</p>
              </div>
            )
          ) : (
            <>
              <div className="d-flex flex-column" style={{ gap: "10px" }}>
                {jobs.map((job) => (
                  <JobRow key={job.id} job={job} onApply={() => setApplyJob(job)} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </>
          )}
        </div>
      </section>

      {applyJob && <JobDialog job={applyJob} onClose={() => setApplyJob(null)} />}
    </>
  );
}

function FilterControls({
  variant,
  noJobCountries,
  totalLive,
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
  countryOptions: CountryOption[];
  variant: "popover" | "inline";
  noJobCountries: CountryOption[];
  totalLive: number | null;
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
      <div style={{ flex: "0 1 250px", minWidth: "220px" }}>
        <CountrySelector
          value={country}
          onChange={setCountry}
          withJobs={countryOptions}
          withoutJobs={noJobCountries}
          totalJobs={totalLive}
          variant={variant}
        />
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
  // Adzuna figures may be Adzuna's own estimates. Until the import records
  // which ones are (salary_is_predicted = false), none are shown as salaries.
  const salary = formatSalary(
    job.source === "adzuna" && job.salary_is_predicted !== false ? { ...job, salary_is_predicted: true } : job,
  );
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
            <CountryFlag code={job.country} height={12} frame={false} decorative />
            {placeLabel(job.city, job.country)}
          </span>
          {posted && <span>{posted}</span>}
        </div>
        {snippet && (
          <p style={{ fontSize: "13px", color: PAPER_DIM, margin: "6px 0 0", lineHeight: 1.4 }}>
            {snippet}
          </p>
        )}
        <JobTrustLine job={job} />
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

        <span className={`jp-salary${salary.specified ? "" : " is-unspecified"}`} style={{ whiteSpace: "nowrap" }}>
          {salary.text}
        </span>

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

function paginationRange(page: number, totalPages: number): (number | "ellipsis")[] {
  const delta = 1;
  const range: (number | "ellipsis")[] = [];
  const start = Math.max(2, page - delta);
  const end = Math.min(totalPages - 1, page + delta);

  range.push(1);
  if (start > 2) range.push("ellipsis");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push("ellipsis");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pageButtonStyle = (active: boolean): React.CSSProperties => ({
    minWidth: "36px",
    height: "36px",
    padding: "0 8px",
    borderRadius: "8px",
    border: `1px solid ${active ? INDIGO : BORDER}`,
    background: active ? INDIGO : "#fff",
    color: active ? "#fff" : INK_NAVY,
    fontWeight: active ? 700 : 500,
    fontSize: "13px",
    cursor: "pointer",
  });

  return (
    <nav
      aria-label="Job listing pages"
      className="d-flex justify-content-center align-items-center flex-wrap"
      style={{ gap: "6px", marginTop: "32px" }}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{
          ...pageButtonStyle(false),
          minWidth: "auto",
          padding: "0 14px",
          opacity: page === 1 ? 0.4 : 1,
          cursor: page === 1 ? "default" : "pointer",
        }}
      >
        Previous
      </button>

      {paginationRange(page, totalPages).map((entry, i) =>
        entry === "ellipsis" ? (
          <span key={`ellipsis-${i}`} style={{ color: PAPER_DIM, padding: "0 4px" }}>
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            style={pageButtonStyle(entry === page)}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{
          ...pageButtonStyle(false),
          minWidth: "auto",
          padding: "0 14px",
          opacity: page === totalPages ? 0.4 : 1,
          cursor: page === totalPages ? "default" : "pointer",
        }}
      >
        Next
      </button>
    </nav>
  );
}

// Shown when a country is selected. General guidance only: no visa,
// permit or pay details are stated unless they have been verified.
function CountryNote({ code }: { code: string }) {
  const name = countryName(code);
  const guide = COUNTRY_GUIDES[code];
  return (
    <div className="container" style={{ marginTop: "16px" }}>
      <div className="jp-note" role="note">
        <CountryFlag code={code} height={16} frame={false} decorative />
        <span>
          <strong>Teaching in {name}:</strong> visa, work-permit and employment requirements vary by destination and
          employer. Confirm them with the employer and the official immigration authority before you accept an offer.{" "}
          {guide && <a href={`/countries/${guide.slug}`}>Read our {guide.guide} guide</a>}
        </span>
      </div>
    </div>
  );
}

// Shown when the chosen country has no current openings (e.g. arriving from a
// country guide). Never shows invented vacancies.
function NoOpenings({ code, onExploreAll }: { code: string; onExploreAll: () => void }) {
  const name = countryName(code);
  const guide = COUNTRY_GUIDES[code];
  return (
    <div className="jp-empty" role="status">
      <span className="jp-empty__flag">
        <CountryFlag code={code} height={36} frame={false} eager />
      </span>
      <h2>No teaching openings in {name} right now</h2>
      <p>
        There are currently no matching teaching opportunities in {name} on our Job Portal. New listings are added
        regularly. In the meantime, you can explore teaching jobs in other countries
        {guide ? ` or keep preparing with our ${guide.guide} guide` : ""}.
      </p>
      <div className="jp-empty__actions">
        <button type="button" className="th-btn" style={{ background: INDIGO, borderColor: INDIGO }} onClick={onExploreAll}>
          Explore teaching jobs in other countries
        </button>
        {guide && (
          <a href={`/countries/${guide.slug}`} className="th-btn style-border2">
            Back to the {guide.guide} guide
          </a>
        )}
      </div>
    </div>
  );
}

const RESEND_COOLDOWN_SECONDS = 30;

// Job details dialog. External vacancies open on the original job site
// directly: no name, email or verification code is asked for, and WTA does
// not receive or forward applications.
const APPLY_SITE_NAMES: Record<string, string> = {
  adzuna: "Adzuna", reed: "Reed", teaching_vacancies: "Teaching Vacancies", usajobs: "USAJOBS",
};

function JobDialog({ job, onClose }: { job: Job; onClose: () => void }) {
  const site = job.source ? APPLY_SITE_NAMES[job.source] ?? job.source_name ?? "the job site" : "the job site";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 1050,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-dialog-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1055,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            background: "#fff",
            borderRadius: "22px",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "32px 32px 28px",
            boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35), 0 2px 6px rgba(15, 23, 42, 0.08)",
            border: "1px solid rgba(15, 23, 42, 0.04)",
          }}
        >
          <div className="d-flex justify-content-between align-items-start" style={{ marginBottom: "18px", gap: "12px" }}>
            <h3 id="job-dialog-title" style={{ fontSize: "20px", margin: 0, color: INK_NAVY, fontWeight: 700, lineHeight: 1.3 }}>
              {job.title}
            </h3>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              autoFocus
              style={{
                background: "#F1F3F9",
                border: "none",
                borderRadius: "999px",
                width: "34px",
                height: "34px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: INK_NAVY,
                cursor: "pointer",
              }}
            >
              <i className="far fa-times" aria-hidden="true"></i>
            </button>
          </div>

          <JobTrustDetails job={job} place={placeLabel(job.city, job.country)} />

          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="th-btn w-100"
            style={{
              background: `linear-gradient(135deg, ${ORANGE}, #EA6A0C)`,
              borderColor: ORANGE,
              borderRadius: "11px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Apply on {site}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <p style={{ fontSize: "12.5px", color: PAPER_DIM, margin: "14px 0 0", lineHeight: 1.5 }}>
            You apply directly on {site === "the job site" ? "the original job site" : site}. World Teachers Academy
            doesn&rsquo;t receive or forward your application.
          </p>

          <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: `1px solid ${BORDER}` }}>
            <ReportJob jobId={job.id} />
          </div>
        </div>
      </div>
    </>
  );
}
