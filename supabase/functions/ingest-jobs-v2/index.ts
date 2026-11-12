// Job import, version 2 — NOT DEPLOYED, NOT SCHEDULED.
// Requires docs/proposals/2026-11-job-verification.sql on the target project.
//
// Differences from ingest-jobs (v1):
//   * every feed/country is a "run" (begin_source_run → upsert_feed_jobs per
//     page → finish_source_run); the database decides what to remove, using
//     the two-complete-misses rule and the outage guard;
//   * a run is only "complete" when every page AND every detail request
//     succeeded — a single failure pauses removals for that feed;
//   * a run is only "exhaustive" when it reached the end of the provider's
//     results. Capped runs (Adzuna's first page) never remove a job for being
//     absent; expire_jobs() hides jobs no feed has listed for 21 days;
//   * closing dates, salary periods, Adzuna salary estimates and eligibility
//     are stored; titles are tagged relevant / not relevant;
//   * the environment guard (guard.ts) refuses to run against the wrong project,
//     and only feeds listed in JOBS_FEEDS_ENABLED run.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { stripHtml } from "../../../lib/html-text.ts";
import { checkEnvironment } from "../_shared/jobs/guard.ts";
import {
  normaliseAdzuna, normaliseReed, normaliseTeachingVacancy, normaliseUsaJob,
  type AdzunaJob, type NormalisedJob, type ReedJob, type TeachingVacancy, type UsaJob,
} from "../_shared/jobs/normalise.ts";

const ADZUNA_MARKETS = ["za", "gb", "us", "ca", "au", "sg", "in", "de", "fr", "nl"];
// Adzuna: search only the last ADZUNA_WINDOW_DAYS days, newest first, 50 per
// page. With enough pages to reach the end of that window the run is
// "exhaustive within the window", so a job posted inside the window that is
// absent from two such runs can be removed; older jobs are never counted as
// missing (finish_source_run p_window_start). With fewer pages the run is
// capped and nothing is removed for absence (the 21-day rule applies).
// ADZUNA_MAX_PAGES defaults to 1 (today's request volume) until the account's
// limits are confirmed; see the Phase C plan for the request estimate.
const ADZUNA_WINDOW_DAYS = 30;
const ADZUNA_MAX_PAGES = Math.max(1, Number(Deno.env.get("ADZUNA_MAX_PAGES") ?? "1") || 1);
const UA = "WorldTeachersAcademy-JobImport/2.0";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retries network errors, 429 and 5xx with back-off. Throws after the last attempt. */
async function getJson<T>(url: string, init: RequestInit = {}, attempts = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
      if (res.ok) return (await res.json()) as T;
      last = new Error(`${res.status} from ${new URL(url).host}`);
      if (res.status !== 429 && res.status < 500) break; // 4xx other than 429: do not hammer
      const retryAfter = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** i);
    } catch (e) {
      last = e;
      await sleep(2000 * 2 ** i);
    }
  }
  throw last;
}

/** Set by each provider generator: did we reach the end of the results? */
type Coverage = { exhaustive: boolean; windowStart?: string };

type RunSummary = { source: string; scope: string; result?: unknown; error?: string; skipped?: string };

async function runFeed(db: SupabaseClient, dryRun: boolean, source: string, scope: string,
                       pages: AsyncGenerator<NormalisedJob[]>, cov: Coverage): Promise<RunSummary> {
  if (dryRun) {
    let n = 0;
    for await (const p of pages) n += p.length;
    return { source, scope, result: { dry_run: true, fetched: n } };
  }
  const { data: runId, error: e1 } = await db.rpc("begin_source_run", { p_source: source, p_scope: scope });
  if (e1) return { source, scope, error: e1.message };
  if (runId === null) return { source, scope, skipped: "another run is in progress" };
  let complete = true;
  let error: string | null = null;
  try {
    for await (const page of pages) {
      if (page.length === 0) continue;
      const { error: e2 } = await db.rpc("upsert_feed_jobs", { p_run_id: runId, p_jobs: page });
      if (e2) throw new Error(e2.message);
    }
  } catch (e) {
    complete = false;
    error = e instanceof Error ? e.message : String(e);
  }
  const { data, error: e3 } = await db.rpc("finish_source_run", {
    p_run_id: runId, p_complete: complete, p_error: error, p_exhaustive: cov.exhaustive,
    p_window_start: cov.windowStart ?? null,
  });
  return { source, scope, result: data, error: e3?.message ?? error ?? undefined };
}

// --- providers -----------------------------------------------------------------------------
async function* adzunaPages(market: string, appId: string, appKey: string, cov: Coverage) {
  cov.exhaustive = false;
  // a day of margin so a job posted right at the edge is not counted as missing
  cov.windowStart = new Date(Date.now() - (ADZUNA_WINDOW_DAYS - 1) * 86_400_000).toISOString();
  for (let page = 1; page <= ADZUNA_MAX_PAGES; page++) {
    const url = `https://api.adzuna.com/v1/api/jobs/${market}/search/${page}?app_id=${appId}&app_key=${appKey}` +
      `&results_per_page=50&what=teacher&max_days_old=${ADZUNA_WINDOW_DAYS}&sort_by=date&content-type=application/json`;
    const data = await getJson<{ results: AdzunaJob[]; count?: number }>(url);
    yield data.results.map((j) => normaliseAdzuna(j, market));
    if (data.results.length < 50 || (data.count != null && page * 50 >= data.count)) {
      cov.exhaustive = true;
      return;
    }
    await sleep(1000);
  }
}

async function* reedPages(apiKey: string, cov: Coverage) {
  const headers = { Authorization: "Basic " + btoa(`${apiKey}:`), "User-Agent": UA };
  const ids = new Set<number>();
  let total = Infinity;
  for (let skip = 0; skip < 1000; skip += 100) {
    const s = await getJson<{ results: { jobId: number }[]; totalResults: number }>(
      `https://www.reed.co.uk/api/1.0/search?keywords=teacher&locationName=UK&resultsToTake=100&resultsToSkip=${skip}`, { headers });
    s.results.forEach((r) => ids.add(r.jobId));
    total = s.totalResults;
    if (skip + 100 >= s.totalResults || s.results.length === 0) break;
    await sleep(300);
  }
  const all = [...ids];
  cov.exhaustive = all.length >= total;
  for (let i = 0; i < all.length; i += 25) {
    // Promise.all, not allSettled: a failed detail request must make the run incomplete,
    // otherwise that job would look "missing from the feed".
    const details = await Promise.all(all.slice(i, i + 25).map((id) =>
      getJson<ReedJob>(`https://www.reed.co.uk/api/1.0/jobs/${id}`, { headers })));
    yield details.map((d) => normaliseReed(d, stripHtml));
    await sleep(300);
  }
}

async function* teachingVacancyPages(cov: Coverage) {
  cov.exhaustive = false;
  let url: string | null = "https://teaching-vacancies.service.gov.uk/api/v1/jobs.json";
  // The DfE API does not return source data when no referrer is given.
  const headers = { "User-Agent": UA, Referer: "https://worldteachers.academy/job-portal" };
  for (let n = 0; url && n < 200; n++) {
    const data: { data?: TeachingVacancy[]; links?: { next?: string | null } } = await getJson(url, { headers });
    yield (data.data ?? []).map((j) => normaliseTeachingVacancy(j, stripHtml));
    url = data.links?.next ?? null;
    await sleep(500);
  }
  cov.exhaustive = url === null;
}

async function* usajobsPages(email: string, key: string, cov: Coverage) {
  cov.exhaustive = false;
  const headers = { Host: "data.usajobs.gov", "User-Agent": email, "Authorization-Key": key };
  // 1710 Education and Vocational Training, 1701 General Education and Training, 1750 Instructional Systems
  for (let page = 1; page <= 20; page++) {
    const data = await getJson<{ SearchResult: { SearchResultItems: UsaJob[]; UserArea?: { NumberOfPages?: string } } }>(
      `https://data.usajobs.gov/api/search?JobCategoryCode=1710;1701;1750&ResultsPerPage=500&Page=${page}`, { headers });
    yield data.SearchResult.SearchResultItems.map(normaliseUsaJob);
    if (page >= Number(data.SearchResult.UserArea?.NumberOfPages ?? 1)) { cov.exhaustive = true; return; }
    await sleep(1000);
  }
}

Deno.serve(async () => {
  const guard = checkEnvironment(Deno.env);
  if (!guard.ok) return new Response(JSON.stringify({ refused: guard.reason }), { status: 412 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const out: RunSummary[] = [];

  if (guard.feeds.has("adzuna")) {
    for (const m of ADZUNA_MARKETS) {
      const cov = { exhaustive: false };
      out.push(await runFeed(db, guard.dryRun, "adzuna", m.toUpperCase(),
        adzunaPages(m, Deno.env.get("ADZUNA_APP_ID")!, Deno.env.get("ADZUNA_APP_KEY")!, cov), cov));
      await sleep(500);
    }
  }
  if (guard.feeds.has("reed")) {
    const cov = { exhaustive: false };
    out.push(await runFeed(db, guard.dryRun, "reed", "GB", reedPages(Deno.env.get("REED_API_KEY")!, cov), cov));
  }
  if (guard.feeds.has("teaching_vacancies")) {
    const cov = { exhaustive: false };
    out.push(await runFeed(db, guard.dryRun, "teaching_vacancies", "GB", teachingVacancyPages(cov), cov));
  }
  if (guard.feeds.has("usajobs")) {
    const cov = { exhaustive: false };
    out.push(await runFeed(db, guard.dryRun, "usajobs", "*",
      usajobsPages(Deno.env.get("USAJOBS_EMAIL")!, Deno.env.get("USAJOBS_API_KEY")!, cov), cov));
  }

  if (!guard.dryRun) {
    await db.rpc("expire_jobs");
    await db.rpc("mark_duplicates");
  }
  return new Response(JSON.stringify({ project: guard.projectRef, runs: out }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
