// Verification worker — NOT DEPLOYED, NOT SCHEDULED.
// Intended schedule (after approval): hourly, staging first.
//
// Claims up to 100 due jobs (claim_jobs_for_check, SKIP LOCKED + 10-min lease,
// so overlapping runs never check the same job), asks the provider's official
// API about each one, and records the outcome with record_check(). All hiding
// rules live in the database; this worker only reports what it saw.
//
// Rate limits: on the first 429 the worker records that one result as
// "transient" and stops. Jobs it had claimed but not checked keep their due
// time and are picked up after the lease expires — nothing is marked.
import { createClient } from "npm:@supabase/supabase-js@2";
import { checkEnvironment } from "../_shared/jobs/guard.ts";
import { reedOutcome, sourcesForVerification, usajobsOutcome, type Outcome } from "../_shared/jobs/checks.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchStatus(url: string, headers: HeadersInit): Promise<{ status: number | null; body: unknown }> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
    const body = res.ok ? await res.json().catch(() => null) : null;
    return { status: res.status, body };
  } catch {
    return { status: null, body: null }; // network error or timeout
  }
}

Deno.serve(async () => {
  const guard = checkEnvironment(Deno.env);
  if (!guard.ok) return new Response(JSON.stringify({ refused: guard.reason }), { status: 412 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const sources = sourcesForVerification().filter((s) => guard.feeds.has(s));
  if (sources.length === 0) return new Response(JSON.stringify({ checked: 0, note: "no verifiable feeds enabled" }));

  const { data: jobs, error } = await db.rpc("claim_jobs_for_check", { p_limit: 100, p_sources: sources });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const reedKey = Deno.env.get("REED_API_KEY");
  const usaHeaders = { Host: "data.usajobs.gov", "User-Agent": Deno.env.get("USAJOBS_EMAIL") ?? "", "Authorization-Key": Deno.env.get("USAJOBS_API_KEY") ?? "" };
  const tally: Record<string, number> = {};

  for (const job of (jobs ?? []) as { id: string; source: string; external_id: string }[]) {
    let res: { outcome: Outcome; detail?: Record<string, unknown> };
    let status: number | null = null;
    if (job.source === "reed" && reedKey) {
      const r = await fetchStatus(`https://www.reed.co.uk/api/1.0/jobs/${job.external_id}`, { Authorization: "Basic " + btoa(`${reedKey}:`) });
      status = r.status;
      res = reedOutcome(r.status, r.body as { expirationDate?: string } | null);
    } else if (job.source === "usajobs") {
      const r = await fetchStatus(`https://data.usajobs.gov/api/search?ControlNumber=${encodeURIComponent(job.external_id)}`, usaHeaders);
      status = r.status;
      res = usajobsOutcome(r.status, r.body as never);
    } else {
      res = { outcome: "unsupported" };
    }
    if (!guard.dryRun) {
      await db.rpc("record_check", { p_job_id: job.id, p_kind: "source_api", p_outcome: res.outcome, p_http_status: status, p_detail: res.detail ?? null });
    }
    tally[res.outcome] = (tally[res.outcome] ?? 0) + 1;
    if (status === 429) break; // provider asked us to slow down
    await sleep(400);
  }
  return new Response(JSON.stringify({ project: guard.projectRef, claimed: jobs?.length ?? 0, outcomes: tally }), {
    headers: { "Content-Type": "application/json" },
  });
});
