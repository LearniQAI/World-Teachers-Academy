import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const keyword = searchParams.get("keyword");
  const employmentType = searchParams.get("employment_type");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  let query = supabaseAnon
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("posted_at", { ascending: false });

  if (country) {
    query = query.eq("country", country);
  }
  if (employmentType) {
    query = query.eq("employment_type", employmentType);
  }
  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,company_name.ilike.%${keyword}%,city.ilike.%${keyword}%`
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    jobs: data,
    total,
    page,
    page_size: PAGE_SIZE,
    total_pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
