import { NextRequest, NextResponse } from "next/server";
import { jobsByIds, relevantJobIndex } from "@/lib/jobs-query";

const PAGE_SIZE = 10;

// Lists active, relevant teaching jobs (see lib/job-relevance.ts), newest
// first, one page at a time. Read-only.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const keyword = searchParams.get("keyword");
  const employmentType = searchParams.get("employment_type");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  try {
    const index = await relevantJobIndex({ country, employmentType, keyword });
    const total = index.length;
    const from = (page - 1) * PAGE_SIZE;
    const jobs = await jobsByIds(index.slice(from, from + PAGE_SIZE).map((r) => r.id));

    return NextResponse.json({
      jobs,
      total,
      page,
      page_size: PAGE_SIZE,
      total_pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
