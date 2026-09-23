import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase";

export interface JobStats {
  /** Active job count rounded down to the nearest 10, or null if unavailable/zero. */
  openRoles: number | null;
  /** Distinct countries with at least one active job, or null if unavailable/zero. */
  countries: number | null;
}

// PostgREST caps a single select at 1000 rows, so page through the `country`
// column to get the same distinct-country set as /api/jobs/countries even
// once there are more than 1000 active jobs.
const PAGE_SIZE = 1000;

async function countDistinctCountries(): Promise<number | null> {
  const countries = new Set<string>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabaseAnon
      .from("jobs")
      .select("country")
      .eq("is_active", true)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return null;
    for (const row of data ?? []) if (row.country) countries.add(row.country);
    if (!data || data.length < PAGE_SIZE) break;
  }
  return countries.size > 0 ? countries.size : null;
}

async function countOpenRoles(): Promise<number | null> {
  const { count, error } = await supabaseAnon
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (error || !count) return null;
  const rounded = Math.floor(count / 10) * 10;
  return rounded > 0 ? rounded : null;
}

// Live numbers for the homepage Job Portal chips. Cached for an hour so the
// homepage never queries Supabase per request; any failure resolves to null
// and the corresponding chip is simply not rendered (never a fallback number).
export const getJobStats = unstable_cache(
  async (): Promise<JobStats> => {
    const [openRoles, countries] = await Promise.all([
      countOpenRoles().catch(() => null),
      countDistinctCountries().catch(() => null),
    ]);
    return { openRoles, countries };
  },
  ["home-job-stats"],
  { revalidate: 3600 },
);
