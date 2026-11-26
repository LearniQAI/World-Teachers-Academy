import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase";
import { checkBearer } from "@/lib/admin-auth";
import { runLeadsMindOutbox } from "@/lib/leadsmind-store";

// Admin view of the LeadsMind sync queue (docs/leadsmind-sync.md).
//
//   GET  ?status=pending|sending|sent|dead&limit=50   → counts + recent rows
//   POST {"action":"retry","id":"<outbox id>"}        → re-queue one row now
//   POST {"action":"retry_dead"}                      → re-queue every dead row
//   POST {"action":"run"}                             → deliver due rows now (max 5)
//
// Requires Authorization: Bearer <LEADSMIND_ADMIN_SECRET>. Without that
// variable the route refuses everything. Responses contain queue metadata
// only: no names or email addresses.

export const dynamic = "force-dynamic";

const STATUSES = new Set(["pending", "sending", "sent", "dead"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function guard(request: NextRequest): NextResponse | null {
  const auth = checkBearer(request.headers.get("authorization"), process.env.LEADSMIND_ADMIN_SECRET);
  if (auth === "unconfigured") return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (auth === "unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: NextRequest) {
  const denied = guard(request);
  if (denied) return denied;

  const status = request.nextUrl.searchParams.get("status");
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 50, 1), 200);

  const { data: summary, error: summaryError } = await supabaseServiceRole.rpc("leadsmind_outbox_summary");
  if (summaryError) return NextResponse.json({ error: "Could not read the queue" }, { status: 500 });

  let query = supabaseServiceRole
    .from("leadsmind_outbox")
    .select("id, lead_id, form_id, status, attempts, last_status_code, last_error, next_attempt_at, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status && STATUSES.has(status)) query = query.eq("status", status);
  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: "Could not read the queue" }, { status: 500 });

  return NextResponse.json({ summary, rows });
}

export async function POST(request: NextRequest) {
  const denied = guard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "retry") {
    if (typeof body.id !== "string" || !UUID_RE.test(body.id)) {
      return NextResponse.json({ error: "A valid outbox id is required" }, { status: 400 });
    }
    const { data, error } = await supabaseServiceRole.rpc("retry_leadsmind_outbox", { p_id: body.id });
    if (error) return NextResponse.json({ error: "Retry failed" }, { status: 500 });
    if (!data) {
      return NextResponse.json(
        { error: "Not re-queued: the row does not exist, was already sent, or is being sent right now" },
        { status: 409 }
      );
    }
    console.info(`[leadsmind-admin] outbox ${body.id} re-queued manually`);
    return NextResponse.json({ ok: true, requeued: 1 });
  }

  if (action === "retry_dead") {
    const { data, error } = await supabaseServiceRole.rpc("retry_dead_leadsmind_outbox");
    if (error) return NextResponse.json({ error: "Retry failed" }, { status: 500 });
    console.info(`[leadsmind-admin] ${data ?? 0} dead outbox rows re-queued manually`);
    return NextResponse.json({ ok: true, requeued: data ?? 0 });
  }

  if (action === "run") {
    const summary = await runLeadsMindOutbox({ limit: 5 });
    return NextResponse.json({ ok: !summary.claimFailed, ...summary }, { status: summary.claimFailed ? 500 : 200 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
