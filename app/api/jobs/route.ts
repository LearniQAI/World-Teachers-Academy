import { NextRequest, NextResponse } from "next/server";
import { jobsByIds, relevantJobIndex } from "@/lib/jobs-query";
import { currentSession } from "@/lib/portal-session";
import { sourceAccess } from "@/lib/source-access";

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
    const rows = await jobsByIds(index.slice(from, from + PAGE_SIZE).map((r) => r.id));
    // Apply links of sources behind the one-time verification go only to
    // verified browsers (lib/portal-access.ts, lib/source-access.ts).
    const verified = !!(await currentSession(request.cookies));
    const jobs = rows.map((j) => {
      const access = sourceAccess(j.source);
      const locked = !(verified || access === "open");
      return { ...j, apply_url: locked ? null : j.apply_url, source_url: locked ? null : j.source_url ?? null, access, locked };
    });

    return NextResponse.json({
      jobs,
      verified,
      total,
      page,
      page_size: PAGE_SIZE,
      total_pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
