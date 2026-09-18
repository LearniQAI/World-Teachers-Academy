import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

// Lightweight endpoint for filter-bar options + the compact stats strip:
// distinct countries actually present in live data, plus the total live
// count. Kept separate from GET /api/jobs so populating the country
// dropdown never depends on (or gets reset by) the current job filters.
export async function GET() {
  const { data, error, count } = await supabaseAnon
    .from("jobs")
    .select("country", { count: "exact" })
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const countries = Array.from(new Set((data ?? []).map((row) => row.country))).sort();

  return NextResponse.json({ countries, total: count ?? data?.length ?? 0 });
}
