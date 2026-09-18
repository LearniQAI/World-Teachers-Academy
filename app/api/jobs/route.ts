import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const keyword = searchParams.get("keyword");
  const employmentType = searchParams.get("employment_type");

  let query = supabaseAnon
    .from("jobs")
    .select("*")
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

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ jobs: data });
}
