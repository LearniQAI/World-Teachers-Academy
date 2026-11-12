import { NextResponse } from "next/server";
import { relevantJobIndex } from "@/lib/jobs-query";

// Lightweight endpoint for the country selector + the stats strip: the
// countries that currently have relevant teaching jobs, how many each, and
// the overall total. Kept separate from GET /api/jobs so the selector never
// depends on (or gets reset by) the current job filters. Read-only.
export async function GET() {
  try {
    const index = await relevantJobIndex({});
    const counts: Record<string, number> = {};
    for (const r of index) counts[r.country] = (counts[r.country] ?? 0) + 1;
    const countries = Object.keys(counts).sort();
    return NextResponse.json({ countries, counts, total: index.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
