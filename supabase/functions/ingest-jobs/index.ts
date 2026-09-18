// Scheduled ingestion: pulls teaching jobs from Adzuna for a fixed set of
// countries, upserts them into `jobs`, and deactivates postings that no
// longer appear in the latest pull for their country.
import { createClient } from "npm:@supabase/supabase-js@2";

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

async function fetchWithRetry(url: string, attempts = 4): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      // Adzuna intermittently returns 503s under load; back off and retry.
      if (res.status === 503) {
        lastError = new Error(`503 from Adzuna (attempt ${i + 1})`);
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      throw new Error(`Adzuna request failed: ${res.status} ${await res.text()}`);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastError;
}

function mapEmploymentType(job: AdzunaJob): string {
  if (job.contract_type === "contract") return "contract";
  if (job.contract_time === "full_time") return "full_time";
  if (job.contract_time === "part_time") return "part_time";
  return "unspecified";
}

function normalize(job: AdzunaJob, country: string) {
  return {
    source: "adzuna",
    external_id: job.id,
    title: job.title,
    description: job.description ?? null,
    company_name: job.company?.display_name ?? null,
    country: country.toUpperCase(),
    city: job.location?.display_name ?? null,
    employment_type: mapEmploymentType(job),
    salary_min: job.salary_min ?? null,
    salary_max: job.salary_max ?? null,
    currency: CURRENCY_BY_COUNTRY[country as (typeof COUNTRIES)[number]],
    apply_url: job.redirect_url,
    posted_at: job.created ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adzunaAppId = Deno.env.get("ADZUNA_APP_ID")!;
  const adzunaAppKey = Deno.env.get("ADZUNA_APP_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const summary: Record<string, { fetched: number; upserted: number; deactivated: number; error?: string }> = {};

  for (const country of COUNTRIES) {
    try {
      const url =
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
        `?app_id=${adzunaAppId}&app_key=${adzunaAppKey}` +
        `&results_per_page=${RESULTS_PER_PAGE}&what=${encodeURIComponent(SEARCH_KEYWORD)}` +
        `&content-type=application/json`;

      const res = await fetchWithRetry(url);
      const data: AdzunaSearchResponse = await res.json();
      const rows = data.results.map((job) => normalize(job, country));

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
        error: err instanceof Error ? err.message : String(err),
      };
    }
    // Small delay between countries to stay well under Adzuna's rate limit.
    await new Promise((r) => setTimeout(r, 500));
  }

  return new Response(JSON.stringify({ summary }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
