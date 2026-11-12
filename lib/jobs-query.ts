import { supabaseAnon, supabaseServiceRole } from "@/lib/supabase";
import { isRelevantTeachingJob } from "@/lib/job-relevance";
import { sourceAccess } from "@/lib/source-access";

// Shared read-only helpers for the Job Portal API routes.
//
// The relevance filter (lib/job-relevance.ts) works on titles, which a
// database query can't express cleanly, so the routes first read the light
// id/title/country columns of every matching active job, keep the relevant
// ones, and only then load full rows for the page being shown. With ~1,000
// active jobs this is two small queries. Supabase returns at most 1,000 rows
// per request, so reads are paged.
//
// Duplicates: the same vacancy is often posted many times (an agency
// re-listing one role, or two feeds carrying it). Rows with the same
// normalised title, employer, place and country are shown once — the newest
// copy. Nothing is deleted; the other copies simply aren't listed.

const CHUNK = 1000;
const MAX_ROWS = 20_000; // safety stop

export type JobFilters = { country?: string | null; employmentType?: string | null; keyword?: string | null };

type LightRow = { id: string; title: string | null; country: string; company_name?: string | null; city?: string | null; source?: string | null };

function norm(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
// Same rule as fingerprint() in supabase/functions/_shared/jobs/normalise.ts:
// the city is cut at the first comma ("Leeds, West Yorkshire" = "Leeds").
export function duplicateKey(r: LightRow): string {
  return `${norm(r.title)}|${norm(r.company_name)}|${norm((r.city ?? "").split(",")[0])}|${r.country}`;
}

export async function relevantJobIndex(filters: JobFilters): Promise<LightRow[]> {
  const out: LightRow[] = [];
  const seen = new Set<string>();
  for (let from = 0; from < MAX_ROWS; from += CHUNK) {
    let q = supabaseAnon
      .from("jobs")
      .select("id, title, country, company_name, city, source")
      .eq("is_active", true)
      .order("posted_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: true });
    if (filters.country) q = q.eq("country", filters.country);
    if (filters.employmentType) q = q.eq("employment_type", filters.employmentType);
    if (filters.keyword) {
      const k = filters.keyword;
      q = q.or(`title.ilike.%${k}%,company_name.ilike.%${k}%,city.ilike.%${k}%`);
    }
    const { data, error } = await q.range(from, from + CHUNK - 1);
    if (error) throw error;
    const rows = (data ?? []) as LightRow[];
    for (const r of rows) {
      if (!isRelevantTeachingJob(r.title)) continue;
      if (sourceAccess(r.source) === "hidden") continue;
      const key = duplicateKey(r);
      if (seen.has(key)) continue; // rows arrive newest first, so the newest copy is kept
      seen.add(key);
      out.push(r);
    }
    if (rows.length < CHUNK) break;
  }
  return out;
}

// Full rows for one page, read with the service role because they include
// apply_url / source_url, which the public key cannot read
// (docs/proposals/2026-11-portal-access.sql). Callers must strip those links
// for browsers that may not open the job (app/api/jobs/route.ts does).
export async function jobsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseServiceRole.from("jobs").select("*").in("id", ids).eq("is_active", true);
  if (error) throw error;
  const order = new Map(ids.map((id, i) => [id, i]));
  return (data ?? []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
