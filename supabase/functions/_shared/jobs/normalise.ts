// Turns each provider's job record into the one shape upsert_feed_jobs() takes
// (docs/proposals/2026-11-job-verification.sql). Pure functions: no network,
// no Deno APIs, so they are unit-tested under Node (tests/unit/normalise.test.ts)
// and imported by the Edge Functions.
//
// Rules shared by every provider:
//   - country is an ISO 3166-1 alpha-2 code, or null when it cannot be mapped
//     with certainty (the database then refuses the row and counts it);
//   - closes_at only when the provider gives a real deadline;
//   - salary_period only when the provider states it;
//   - salary_is_predicted when the figure is the provider's estimate;
//   - eligibility is the provider's own wording, never paraphrased;
//   - is_relevant comes from lib/job-relevance.ts; irrelevant rows are stored
//     as 'not_relevant' (so they count towards the outage guard) and never shown.
import { isRelevantTeachingJob } from "../../../../lib/job-relevance.ts";

export type SalaryPeriod = "year" | "month" | "week" | "day" | "hour";

export type NormalisedJob = {
  external_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  country: string | null;
  city: string | null;
  employment_type: "full_time" | "part_time" | "contract" | "unspecified";
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_period: SalaryPeriod | null;
  /** The provider's own salary wording, shown verbatim when it can't be read as numbers safely. */
  salary_text: string | null;
  salary_is_predicted: boolean;
  apply_url: string;
  posted_at: string | null;
  closes_at: string | null;
  eligibility: string | null;
  is_restricted: boolean;
  source_name: string;
  source_url: string | null;
  fingerprint: string;
  is_relevant: boolean;
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Same vacancy from two feeds → same fingerprint. City is cut at the first comma
 * ("Leeds, West Yorkshire" = "Leeds"). Must match lib/jobs-query.ts duplicateKey. */
export function fingerprint(title: string | null, company: string | null, city: string | null, country: string | null): string {
  const town = (city ?? "").split(",")[0];
  return `${norm(title)}|${norm(company)}|${norm(town)}|${country ?? ""}`;
}

function num(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v.replace(/[, ]/g, "")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function iso(d: unknown): string | null {
  if (typeof d !== "string" || !d.trim()) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/** "DD/MM/YYYY" → ISO. endOfDay for closing dates (open until the end of that day, UK time ≈ 23:59 UTC). */
export function parseDmy(d: string | null | undefined, endOfDay = false): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d ?? "");
  if (!m) return null;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T${endOfDay ? "23:59:59" : "00:00:00"}Z`).toISOString();
}

const ISO2 = /^[A-Z]{2}$/;
// Country names as USAJOBS and similar sources print them. Only names we are
// sure of; anything else returns null and the row is refused, not guessed.
const COUNTRY_BY_NAME: Record<string, string> = {
  "united states": "US", "usa": "US", "united kingdom": "GB", "germany": "DE", "japan": "JP", "korea, south": "KR",
  "south korea": "KR", "republic of korea": "KR", "italy": "IT", "spain": "ES", "belgium": "BE", "netherlands": "NL",
  "united arab emirates": "AE", "kuwait": "KW", "qatar": "QA", "bahrain": "BH", "cuba": "CU", "puerto rico": "PR",
  "guam": "GU", "canada": "CA", "australia": "AU", "singapore": "SG", "south africa": "ZA", "france": "FR",
  "india": "IN", "turkey": "TR", "turkiye": "TR", "portugal": "PT", "poland": "PL", "hungary": "HU",
};
export function countryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (ISO2.test(v)) return v === "UK" ? null : v; // "UK" is not ISO; refuse rather than guess
  return COUNTRY_BY_NAME[v.toLowerCase()] ?? null;
}

function finish(j: Omit<NormalisedJob, "fingerprint" | "is_relevant" | "salary_text"> & { salary_text?: string | null },
                relevant?: boolean): NormalisedJob {
  return {
    ...j,
    salary_text: j.salary_text ?? null,
    fingerprint: fingerprint(j.title, j.company_name, j.city, j.country),
    is_relevant: relevant ?? isRelevantTeachingJob(j.title),
  };
}

// ---------------------------------------------------------------------------
// Adzuna — https://developer.adzuna.com/docs/search
// No closing date and no per-job lookup. Salary may be Adzuna's estimate
// ("salary_is_predicted": "1"). Currency follows the country market.
// ---------------------------------------------------------------------------
export const ADZUNA_CURRENCY: Record<string, string> = {
  gb: "GBP", us: "USD", ca: "CAD", au: "AUD", nz: "NZD", sg: "SGD", in: "INR", za: "ZAR", br: "BRL", mx: "MXN",
  pl: "PLN", ch: "CHF", de: "EUR", fr: "EUR", nl: "EUR", at: "EUR", be: "EUR", es: "EUR", it: "EUR",
};
export type AdzunaJob = {
  id: string | number; title: string; description?: string; redirect_url: string; created?: string;
  company?: { display_name?: string }; location?: { display_name?: string; area?: string[] };
  salary_min?: number; salary_max?: number; salary_is_predicted?: string | number;
  contract_type?: string; contract_time?: string;
};
export function normaliseAdzuna(job: AdzunaJob, market: string): NormalisedJob {
  const m = market.toLowerCase();
  return finish({
    external_id: String(job.id),
    title: job.title?.trim() ?? "",
    description: job.description ?? null,
    company_name: job.company?.display_name?.trim() || null,
    country: countryCode(m.toUpperCase()),
    city: job.location?.display_name ?? null,
    employment_type: job.contract_type === "contract" ? "contract"
      : job.contract_time === "full_time" ? "full_time" : job.contract_time === "part_time" ? "part_time" : "unspecified",
    salary_min: num(job.salary_min),
    salary_max: num(job.salary_max),
    currency: ADZUNA_CURRENCY[m] ?? null,
    salary_period: null, // Adzuna does not state the period
    salary_is_predicted: String(job.salary_is_predicted ?? "0") === "1",
    apply_url: job.redirect_url, // used exactly as given (tracking link)
    posted_at: iso(job.created),
    closes_at: null,
    eligibility: null,
    is_restricted: false,
    source_name: "Adzuna",
    source_url: null,
  });
}

// ---------------------------------------------------------------------------
// Reed — https://www.reed.co.uk/developers/jobseeker (job detail endpoint)
// expirationDate and salaryType come from /jobs/{id}. Field names checked
// against the documented detail response; confirm on one live record before go-live.
// ---------------------------------------------------------------------------
export type ReedJob = {
  jobId: number; jobTitle: string; employerName?: string; locationName?: string;
  minimumSalary?: number | null; maximumSalary?: number | null; salaryType?: string | null;
  datePosted?: string; expirationDate?: string; jobUrl: string; externalUrl?: string | null;
  partTime?: boolean; fullTime?: boolean; contractType?: string; jobDescription?: string;
};
const REED_PERIOD: Record<string, SalaryPeriod> = {
  "per annum": "year", "per month": "month", "per week": "week", "per day": "day", "per hour": "hour",
};
export function normaliseReed(job: ReedJob, stripHtml: (s: string) => string = (s) => s): NormalisedJob {
  const ct = (job.contractType ?? "").toLowerCase();
  return finish({
    external_id: String(job.jobId),
    title: job.jobTitle?.trim() ?? "",
    description: job.jobDescription ? stripHtml(job.jobDescription) : null,
    company_name: job.employerName?.trim() || null,
    country: "GB",
    city: job.locationName ?? null,
    employment_type: ct && ct !== "permanent" ? "contract" : job.partTime ? "part_time" : job.fullTime ? "full_time" : "unspecified",
    salary_min: num(job.minimumSalary),
    salary_max: num(job.maximumSalary),
    currency: "GBP",
    salary_period: REED_PERIOD[(job.salaryType ?? "").toLowerCase().trim()] ?? null,
    salary_is_predicted: false,
    apply_url: job.jobUrl,
    posted_at: parseDmy(job.datePosted),
    closes_at: parseDmy(job.expirationDate, true),
    eligibility: null,
    is_restricted: false,
    source_name: "Reed",
    source_url: job.jobUrl,
  });
}

// ---------------------------------------------------------------------------
// Teaching Vacancies (DfE) — https://teaching-vacancies.service.gov.uk/api/v1/jobs.json
// schema.org JobPosting. Open Government Licence v3.0. Checked against a live
// response on 12 Nov 2026 (tests/fixtures/teaching-vacancies-page1.json):
//   - there is no job id field; the listing URL is the stable id;
//   - baseSalary.value.value is FREE TEXT ("£25,614.00 - £26,016.00 Annually
//     (FTE)\n\rActual pro rata salary £17,863", "M1 - M6", "MPS-UPS"), often with
//     both full-time and pro-rata figures. It is stored verbatim (first line) in
//     salary_text and never parsed into numbers, so nothing is misread;
//   - occupationalCategory says what kind of school job it is; admin, finance,
//     catering, cleaning, site and business roles are not education roles.
// ---------------------------------------------------------------------------
const TV_EDUCATION = new Set(["teacher", "teaching_assistant", "head_of_department_or_curriculum", "education_support",
  "student_support_learning_and_progress", "sendco"]);
const TV_NOT_EDUCATION = new Set(["administration_hr_data_and_finance", "catering_cleaning_and_site_management",
  "business_support_administration_and_corporate_services"]);
export function teachingVacancyRelevant(title: string, category: string | null | undefined): boolean {
  if (category && TV_EDUCATION.has(category)) return !!title?.trim();
  if (category && TV_NOT_EDUCATION.has(category)) return false;
  return isRelevantTeachingJob(title); // leadership, pastoral, other support: decided by the title
}
function salaryTextLine(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const first = v.split(/[\r\n]+/)[0].replace(/\s+/g, " ").trim();
  return first ? first.slice(0, 120) : null;
}
type TvPlace = { address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } };
export type TeachingVacancy = {
  id?: string; identifier?: { value?: string } | string; title: string; description?: string; url: string;
  datePosted?: string; validThrough?: string; employmentType?: string | string[];
  hiringOrganization?: { name?: string };
  jobLocation?: TvPlace | TvPlace[];
  baseSalary?: { currency?: string; value?: { minValue?: number | string; maxValue?: number | string; value?: number | string; unitText?: string } };
  occupationalCategory?: string | null;
};
const SCHEMA_PERIOD: Record<string, SalaryPeriod> = { YEAR: "year", MONTH: "month", WEEK: "week", DAY: "day", HOUR: "hour" };
function schemaEmployment(t: string | string[] | undefined): NormalisedJob["employment_type"] {
  const all = (Array.isArray(t) ? t : t ? [t] : []).map((x) => x.toUpperCase());
  if (all.some((x) => x === "TEMPORARY" || x === "CONTRACTOR")) return "contract";
  if (all.includes("FULL_TIME")) return "full_time";
  if (all.includes("PART_TIME")) return "part_time";
  return "unspecified";
}
export function normaliseTeachingVacancy(job: TeachingVacancy, stripHtml: (s: string) => string = (s) => s): NormalisedJob {
  const place = Array.isArray(job.jobLocation) ? job.jobLocation[0] : job.jobLocation;
  const id = typeof job.identifier === "string" ? job.identifier : job.identifier?.value ?? job.id ?? job.url;
  const v = job.baseSalary?.value;
  // Structured numbers only when the provider sends them as numbers (min/max fields).
  const structured = v?.minValue != null || v?.maxValue != null;
  return finish({
    external_id: String(id),
    title: job.title?.trim() ?? "",
    description: job.description ? stripHtml(job.description) : null,
    company_name: job.hiringOrganization?.name?.trim() || null,
    country: countryCode(place?.address?.addressCountry ?? "GB"),
    city: place?.address?.addressLocality ?? place?.address?.addressRegion ?? null,
    employment_type: schemaEmployment(job.employmentType),
    salary_min: structured ? num(v?.minValue) : null,
    salary_max: structured ? num(v?.maxValue) : null,
    currency: job.baseSalary?.currency ?? (v ? "GBP" : null),
    salary_period: SCHEMA_PERIOD[(v?.unitText ?? "").toUpperCase()] ?? null,
    salary_text: structured ? null : salaryTextLine(v?.value),
    salary_is_predicted: false,
    apply_url: job.url,
    posted_at: iso(job.datePosted),
    closes_at: iso(job.validThrough),
    eligibility: null,
    is_restricted: false,
    source_name: "Teaching Vacancies (Department for Education)",
    source_url: job.url,
  }, teachingVacancyRelevant(job.title, job.occupationalCategory));
}

// ---------------------------------------------------------------------------
// USAJOBS — https://developer.usajobs.gov/api-reference/get-api-search
// Federal jobs often have hiring restrictions ("Who may apply"). They are kept
// in the provider's words and flagged so the portal shows them prominently.
// One record can list several locations; we store the first and keep the rest
// in the description only — the location count is shown on USAJOBS itself.
// ---------------------------------------------------------------------------
export type UsaJob = {
  MatchedObjectId: string;
  MatchedObjectDescriptor: {
    PositionID?: string; PositionTitle: string; PositionURI: string; ApplyURI?: string[];
    OrganizationName?: string; DepartmentName?: string;
    PositionLocation?: { CityName?: string; LocationName?: string; CountryCode?: string }[];
    PositionRemuneration?: { MinimumRange?: string; MaximumRange?: string; RateIntervalCode?: string }[];
    PositionSchedule?: { Name?: string }[];
    PublicationStartDate?: string; ApplicationCloseDate?: string; QualificationSummary?: string;
    UserArea?: { Details?: { WhoMayApply?: { Name?: string }; HiringPath?: string[]; JobSummary?: string } };
  };
};
const USA_PERIOD: Record<string, SalaryPeriod> = { PA: "year", PM: "month", PW: "week", PD: "day", PH: "hour" };
export function normaliseUsaJob(job: UsaJob): NormalisedJob {
  const d = job.MatchedObjectDescriptor;
  const loc = d.PositionLocation?.[0];
  const pay = d.PositionRemuneration?.[0];
  const details = d.UserArea?.Details;
  const paths = details?.HiringPath ?? [];
  const schedule = (d.PositionSchedule?.[0]?.Name ?? "").toLowerCase();
  // LocationName looks like "Kaiserslautern, Germany" or "Fort Bragg, North Carolina".
  const country = countryCode(loc?.CountryCode) ?? null;
  return finish({
    external_id: job.MatchedObjectId,
    title: d.PositionTitle?.trim() ?? "",
    description: details?.JobSummary ?? d.QualificationSummary ?? null,
    company_name: [d.OrganizationName, d.DepartmentName].filter(Boolean).join(" — ") || null,
    country,
    city: loc?.CityName ?? loc?.LocationName ?? null,
    employment_type: schedule.includes("full") ? "full_time" : schedule.includes("part") ? "part_time"
      : schedule ? "contract" : "unspecified",
    salary_min: num(pay?.MinimumRange),
    salary_max: num(pay?.MaximumRange),
    currency: pay ? "USD" : null,
    salary_period: USA_PERIOD[pay?.RateIntervalCode ?? ""] ?? null,
    salary_is_predicted: false,
    apply_url: d.ApplyURI?.[0] ?? d.PositionURI,
    posted_at: iso(d.PublicationStartDate),
    closes_at: iso(d.ApplicationCloseDate),
    eligibility: details?.WhoMayApply?.Name?.trim() || null,
    // Open to everyone only when the hiring paths include "public".
    is_restricted: !paths.map((p) => p.toLowerCase()).includes("public"),
    source_name: "USAJOBS",
    source_url: d.PositionURI,
  });
}
