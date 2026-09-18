// Scheduled ingestion: pulls teaching jobs from Adzuna (all 10 countries)
// and Reed.co.uk (UK-only, additional volume/quality for GB specifically —
// not new country coverage), upserts them into `jobs`, deactivates postings
// that no longer appear in the latest pull, and suppresses Reed listings
// that look like duplicates of an already-active Adzuna GB listing.
import { createClient } from "npm:@supabase/supabase-js@2";
import { stripHtml } from "../../../lib/html-text.ts";

const COUNTRIES = ["za", "gb", "us", "ca", "au", "sg", "in", "de", "fr", "nl"] as const;

// Adzuna doesn't return a per-job currency field; it's implied by the
// country market. https://api.adzuna.com/v1/api/jobs/{country}/... always
// prices in that market's local currency.
const CURRENCY_BY_COUNTRY: Record<(typeof COUNTRIES)[number], string> = {
  za: "ZAR",
  gb: "GBP",
  us: "USD",
  ca: "CAD",
  au: "AUD",
  sg: "SGD",
  in: "INR",
  de: "EUR",
  fr: "EUR",
  nl: "EUR",
};

const RESULTS_PER_PAGE = 50; // Adzuna's per-request max, verified empirically.
const SEARCH_KEYWORD = "teacher";

interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  contract_type?: string; // "permanent" | "contract"
  contract_time?: string; // "full_time" | "part_time"
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created?: string;
}

interface AdzunaSearchResponse {
  results: AdzunaJob[];
  count: number;
}

interface JobRow {
  source: string;
  external_id: string;
  title: string;
  description: string | null;
  company_name: string | null;
  country: string;
  city: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  apply_url: string;
  posted_at: string | null;
  is_active: boolean;
  updated_at: string;
}

async function fetchWithRetry(url: string, init: RequestInit = {}, attempts = 4): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      // Both Adzuna and Reed intermittently return 5xx under load; back off and retry.
      if (res.status >= 500) {
        lastError = new Error(`${res.status} from ${url} (attempt ${i + 1})`);
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      throw new Error(`Request failed: ${res.status} ${await res.text()}`);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastError;
}

function mapAdzunaEmploymentType(job: AdzunaJob): string {
  if (job.contract_type === "contract") return "contract";
  if (job.contract_time === "full_time") return "full_time";
  if (job.contract_time === "part_time") return "part_time";
  return "unspecified";
}

function normalizeAdzuna(job: AdzunaJob, country: string): JobRow {
  return {
    source: "adzuna",
    external_id: job.id,
    title: job.title,
    description: job.description ?? null,
    company_name: job.company?.display_name ?? null,
    country: country.toUpperCase(),
    city: job.location?.display_name ?? null,
    employment_type: mapAdzunaEmploymentType(job),
    salary_min: job.salary_min ?? null,
    salary_max: job.salary_max ?? null,
    currency: CURRENCY_BY_COUNTRY[country as (typeof COUNTRIES)[number]],
    apply_url: job.redirect_url,
    posted_at: job.created ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Reed.co.uk
// ---------------------------------------------------------------------------
// Reed's /search endpoint's own response objects do NOT include contractType,
// fullTime, partTime, a proper city name (only a raw postcode), or an
// HTML-formatted description — verified against the live API, not assumed.
// Those fields only exist on the per-job /jobs/{id} detail endpoint, so full
// details are fetched for every search result rather than relying on the
// cheap search payload alone.
const REED_SEARCH_URL = "https://www.reed.co.uk/api/1.0/search";
const REED_JOB_URL = "https://www.reed.co.uk/api/1.0/jobs";
const REED_RESULTS_PER_PAGE = 100; // Reed's real per-page cap — verified empirically; requesting more still returns 100.
const REED_DETAIL_BATCH_SIZE = 50; // concurrency per batch; verified safe (no rate-limiting) up to 100 concurrent in testing.
const REED_MAX_JOBS = 1000; // circuit breaker in case a future run's result count balloons unexpectedly.

interface ReedSearchResult {
  jobId: number;
}
interface ReedSearchResponse {
  results: ReedSearchResult[];
  totalResults: number;
}
interface ReedJobDetail {
  jobId: number;
  jobTitle: string;
  employerName?: string;
  locationName?: string;
  minimumSalary?: number | null;
  maximumSalary?: number | null;
  currency?: string;
  datePosted?: string; // "DD/MM/YYYY"
  jobUrl: string;
  partTime?: boolean;
  fullTime?: boolean;
  contractType?: string; // "Permanent" | "Temporary" | "Contract" (observed values)
  jobDescription?: string; // HTML
}

function reedAuthHeader(apiKey: string): HeadersInit {
  return { Authorization: "Basic " + btoa(`${apiKey}:`) };
}

async function fetchAllReedJobIds(apiKey: string): Promise<number[]> {
  // A Set, not an array — Reed's result set is live, and the ranking can
  // shift between paginated requests (resultsToSkip), which occasionally
  // pushes the same jobId onto two consecutive pages. Deduping here (rather
  // than only at upsert time) also saves a redundant detail fetch per dupe.
  const ids = new Set<number>();
  let skip = 0;
  // deno-lint-ignore no-constant-condition
  while (true) {
    const url =
      `${REED_SEARCH_URL}?keywords=${encodeURIComponent(SEARCH_KEYWORD)}&locationName=UK` +
      `&resultsToTake=${REED_RESULTS_PER_PAGE}&resultsToSkip=${skip}`;
    const res = await fetchWithRetry(url, { headers: reedAuthHeader(apiKey) });
    const data: ReedSearchResponse = await res.json();
    for (const r of data.results) ids.add(r.jobId);
    skip += REED_RESULTS_PER_PAGE;
    if (skip >= data.totalResults || data.results.length === 0 || ids.size >= REED_MAX_JOBS) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  return [...ids].slice(0, REED_MAX_JOBS);
}

async function fetchReedJobDetails(apiKey: string, jobIds: number[]): Promise<ReedJobDetail[]> {
  const details: ReedJobDetail[] = [];
  for (let i = 0; i < jobIds.length; i += REED_DETAIL_BATCH_SIZE) {
    const batch = jobIds.slice(i, i + REED_DETAIL_BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (id) => {
        const res = await fetchWithRetry(`${REED_JOB_URL}/${id}`, { headers: reedAuthHeader(apiKey) });
        return (await res.json()) as ReedJobDetail;
      })
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled") details.push(r.value);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return details;
}

// Same priority rule as Adzuna's mapAdzunaEmploymentType: a non-permanent
// contractType wins over the full/part-time flags (observed real combos:
// "Temporary"+fullTime, "Temporary"+partTime, "Contract"+fullTime,
// "Contract"+partTime, "Permanent"+fullTime, "Permanent"+partTime — so a
// job can be e.g. "Temporary" AND part-time, and this bucket keeps the
// "temporary/contract" signal, matching how Adzuna's contract_type is
// treated as the stronger signal when both are present).
function mapReedEmploymentType(job: ReedJobDetail): string {
  const contractType = (job.contractType ?? "").toLowerCase();
  if (contractType && contractType !== "permanent") return "contract";
  if (job.partTime === true) return "part_time";
  if (job.fullTime === true) return "full_time";
  return "unspecified";
}

function parseReedDate(d: string | null | undefined): string | null {
  if (!d) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).toISOString();
}

function normalizeReed(job: ReedJobDetail): JobRow {
  return {
    source: "reed",
    external_id: String(job.jobId),
    title: job.jobTitle,
    description: job.jobDescription ? stripHtml(job.jobDescription) : null,
    company_name: job.employerName ?? null,
    country: "GB",
    city: job.locationName ?? null,
    employment_type: mapReedEmploymentType(job),
    salary_min: job.minimumSalary ?? null,
    salary_max: job.maximumSalary ?? null,
    // Reed jobs are always GBP — set explicitly rather than trusting the
    // response's own `currency` field (present in testing, but not
    // guaranteed, and irrelevant since Reed is UK-only by construction).
    currency: "GBP",
    apply_url: job.jobUrl,
    posted_at: parseReedDate(job.datePosted),
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

// Best-effort cross-source dedupe: strips case/punctuation/accents so
// "St. Mary's School" and "St Marys School" match, per the "minor
// whitespace/punctuation differences" allowance — not true fuzzy/edit-
// distance matching, which was not requested and adds real false-positive
// risk of its own.
function normalizeForMatch(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchKey(title: string | null, company: string | null, city: string | null): string {
  return `${normalizeForMatch(title)}|${normalizeForMatch(company)}|${normalizeForMatch(city)}`;
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adzunaAppId = Deno.env.get("ADZUNA_APP_ID")!;
  const adzunaAppKey = Deno.env.get("ADZUNA_APP_KEY")!;
  const reedApiKey = Deno.env.get("REED_API_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const summary: Record<
    string,
    {
      fetched: number;
      upserted: number;
      deactivated: number;
      suppressedDuplicates?: number;
      suppressedDetails?: Array<{ title: string; company_name: string | null; city: string | null; matchedAdzunaId: string }>;
      error?: string;
    }
  > = {};

  for (const country of COUNTRIES) {
    try {
      const url =
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
        `?app_id=${adzunaAppId}&app_key=${adzunaAppKey}` +
        `&results_per_page=${RESULTS_PER_PAGE}&what=${encodeURIComponent(SEARCH_KEYWORD)}` +
        `&content-type=application/json`;

      const res = await fetchWithRetry(url);
      const data: AdzunaSearchResponse = await res.json();
      const rows = data.results.map((job) => normalizeAdzuna(job, country));

      if (rows.length > 0) {
        const { error: upsertError } = await supabase
          .from("jobs")
          .upsert(rows, { onConflict: "source,external_id" });
        if (upsertError) throw upsertError;
      }

      const seenIds = rows.map((r) => r.external_id);
      let deactivated = 0;
      if (seenIds.length > 0) {
        const { data: deactivatedRows, error: deactivateError } = await supabase
          .from("jobs")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("source", "adzuna")
          .eq("country", country.toUpperCase())
          .eq("is_active", true)
          .not("external_id", "in", `(${seenIds.map((id) => `"${id}"`).join(",")})`)
          .select("id");
        if (deactivateError) throw deactivateError;
        deactivated = deactivatedRows?.length ?? 0;
      }

      summary[country] = { fetched: rows.length, upserted: rows.length, deactivated };
    } catch (err) {
      summary[country] = {
        fetched: 0,
        upserted: 0,
        deactivated: 0,
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
    // Small delay between countries to stay well under Adzuna's rate limit.
    await new Promise((r) => setTimeout(r, 500));
  }

  // ---------------------------------------------------------------------
  // Reed.co.uk (GB only) — runs in the same invocation as Adzuna, per the
  // requirement that both sources' dedupe check runs against same-day data.
  // ---------------------------------------------------------------------
  try {
    const jobIds = await fetchAllReedJobIds(reedApiKey);
    const details = await fetchReedJobDetails(reedApiKey, jobIds);
    const candidateRows = details.map(normalizeReed);

    // One cheap query for all currently-active Adzuna GB rows, matched
    // in-memory — avoids an N+1 query per Reed job.
    const { data: activeAdzunaGb, error: adzunaFetchError } = await supabase
      .from("jobs")
      .select("id, title, company_name, city")
      .eq("source", "adzuna")
      .eq("country", "GB")
      .eq("is_active", true);
    if (adzunaFetchError) throw adzunaFetchError;

    const adzunaByKey = new Map<string, string>();
    for (const job of activeAdzunaGb ?? []) {
      adzunaByKey.set(matchKey(job.title, job.company_name, job.city), job.id);
    }

    const rowsToUpsert: JobRow[] = [];
    const upsertedExternalIds: string[] = [];
    const suppressedDetails: Array<{ title: string; company_name: string | null; city: string | null; matchedAdzunaId: string }> = [];

    for (const row of candidateRows) {
      const matchedAdzunaId = adzunaByKey.get(matchKey(row.title, row.company_name, row.city));
      if (matchedAdzunaId) {
        suppressedDetails.push({
          title: row.title,
          company_name: row.company_name,
          city: row.city,
          matchedAdzunaId,
        });
        continue;
      }
      rowsToUpsert.push(row);
      upsertedExternalIds.push(row.external_id);
    }

    if (rowsToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from("jobs")
        .upsert(rowsToUpsert, { onConflict: "source,external_id" });
      if (upsertError) throw upsertError;
    }

    // Deactivate stale Reed rows: anything previously upserted as `source =
    // 'reed'` that either no longer appears in today's Reed pull, OR that
    // *newly* matched an Adzuna duplicate this run (upsertedExternalIds
    // deliberately excludes suppressed jobs, so a Reed row inserted in an
    // earlier run that now looks like a duplicate gets cleaned up here).
    let deactivated = 0;
    if (upsertedExternalIds.length > 0) {
      const { data: deactivatedRows, error: deactivateError } = await supabase
        .from("jobs")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("source", "reed")
        .eq("country", "GB")
        .eq("is_active", true)
        .not("external_id", "in", `(${upsertedExternalIds.map((id) => `"${id}"`).join(",")})`)
        .select("id");
      if (deactivateError) throw deactivateError;
      deactivated = deactivatedRows?.length ?? 0;
    }

    summary["reed_gb"] = {
      fetched: details.length,
      upserted: rowsToUpsert.length,
      deactivated,
      suppressedDuplicates: suppressedDetails.length,
      suppressedDetails,
    };
  } catch (err) {
    summary["reed_gb"] = {
      fetched: 0,
      upserted: 0,
      deactivated: 0,
      error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }

  return new Response(JSON.stringify({ summary }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
