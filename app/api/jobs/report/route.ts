import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase";
import { scrubNote } from "@/lib/job-report";

// "Report an unavailable job". Stores the job, a reason and an optional short
// note — no name, e-mail or IP address. A report never hides a job by itself:
// report_job() (docs/proposals/2026-11-job-verification.sql) brings the job's
// next check forward and raises an alert if reports spike.
//
// Until that SQL is approved and applied, the function does not exist and this
// route answers 503 so the form can say reporting isn't available yet.

const REASONS = new Set(["link_broken", "job_closed", "wrong_details", "not_a_teaching_job", "other"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Best-effort flood control per server instance (keyed by a hash, not stored).
const recent = new Map<string, number[]>();
function allow(key: string, limit = 10, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) return false;
  list.push(now);
  recent.set(key, list);
  if (recent.size > 5000) recent.clear();
  return true;
}

export async function POST(request: NextRequest) {
  let body: { job_id?: unknown; reason?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const jobId = typeof body.job_id === "string" ? body.job_id : "";
  const reason = typeof body.reason === "string" ? body.reason : "";
  if (!UUID.test(jobId) || !REASONS.has(reason)) {
    return NextResponse.json({ error: "Please choose a reason." }, { status: 400 });
  }

  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = Array.from(new TextEncoder().encode(fwd)).reduce((h, b) => (h * 31 + b) >>> 0, 7).toString(36);
  if (!allow(key)) {
    return NextResponse.json({ error: "Too many reports from this connection. Please try again later." }, { status: 429 });
  }

  const { data, error } = await supabaseServiceRole.rpc("report_job", {
    p_job_id: jobId,
    p_reason: reason,
    p_note: scrubNote(body.note),
  });
  if (error) {
    const missing = /function .*report_job|could not find the function/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "Reporting isn't available yet." : "We couldn't save your report. Please try again." },
      { status: missing ? 503 : 500 },
    );
  }
  if (data === "not_visible") return NextResponse.json({ status: "already_removed" });
  return NextResponse.json({ status: "recorded" });
}
