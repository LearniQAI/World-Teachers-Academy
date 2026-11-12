import { supabaseAnon } from "@/lib/supabase";
import { isRelevantTeachingJob } from "@/lib/job-relevance";

// Shared read-only helpers for the Job Portal API routes.
//
// The relevance filter (lib/job-relevance.ts) works on titles, which a
// database query can't express cleanly, so the routes first read the light
// id/title/country columns of every matching active job, keep the relevant
// ones, and only then load full rows for the page being shown. With ~1,000
// active jobs this is two small queries. Supabase returns at most 1,000 rows
// per request, so reads are paged.

const CHUNK = 1000;
const MAX_ROWS = 20_000; // safety stop

export type JobFilters = { country?: string | null; employmentType?: string | null; keyword?: string | null };

type LightRow = { id: string; title: string | null; country: string };

export async function relevantJobIndex(filters: JobFilters): Promise<LightRow[]> {
  const out: LightRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += CHUNK) {
    let q = supabaseAnon
      .from("jobs")
      .select("id, title, country")
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
    for (const r of rows) if (isRelevantTeachingJob(r.title)) out.push(r);
    if (rows.length < CHUNK) break;
  }
  return out;
}

export async function jobsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseAnon.from("jobs").select("*").in("id", ids);
  if (error) throw error;
  const order = new Map(ids.map((id, i) => [id, i]));
  return (data ?? []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
