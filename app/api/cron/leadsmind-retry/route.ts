import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase";
import { checkBearer } from "@/lib/admin-auth";
import { enqueueMissingLeads, runLeadsMindOutbox } from "@/lib/leadsmind-store";

// Retries LeadsMind deliveries that failed (see lib/leadsmind.ts).
// Scheduled every 10 minutes by vercel.json (Vercel Cron, production only).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when the
// project has CRON_SECRET set. Without CRON_SECRET the route refuses every call.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(request: NextRequest) {
  const auth = checkBearer(request.headers.get("authorization"), process.env.CRON_SECRET);
  if (auth === "unconfigured") return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (auth === "unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Safety net for leads whose outbox insert failed. Off unless
  // LEADSMIND_SYNC_START (ISO date) is set; never reaches further back than it.
  let backfilled = 0;
  const start = process.env.LEADSMIND_SYNC_START ? new Date(process.env.LEADSMIND_SYNC_START) : null;
  if (start && !Number.isNaN(start.getTime())) {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    try {
      backfilled = await enqueueMissingLeads(start > twoDaysAgo ? start : twoDaysAgo);
    } catch (err) {
      console.error("[leadsmind-retry] backfill failed:", err instanceof Error ? err.message : "unknown");
    }
  }

  // 5 per run matches LeadsMind's per-IP limit of 5 submissions a minute.
  const summary = await runLeadsMindOutbox({ limit: 5 });

  // Retention: delivered rows older than LEADSMIND_RETENTION_DAYS (default
  // 180, minimum 30) are removed. Pending and dead rows are kept.
  let purged = 0;
  const days = Number.parseInt(process.env.LEADSMIND_RETENTION_DAYS ?? "", 10);
  const { data: removed, error: purgeError } = await supabaseServiceRole.rpc("purge_sent_leadsmind_outbox", {
    p_days: Number.isFinite(days) ? days : 180,
  });
  if (purgeError) console.error("[leadsmind-retry] purge failed:", purgeError.code ?? "unknown");
  else purged = typeof removed === "number" ? removed : 0;

  console.info(
    `[leadsmind-retry] backfilled=${backfilled} claimed=${summary.claimed} sent=${summary.sent} retrying=${summary.retrying} dead=${summary.dead} purged=${purged}`
  );
  // 500 when the queue couldn't be read, so a scheduler/monitor sees the failure.
  return NextResponse.json(
    { ok: !summary.claimFailed, backfilled, purged, ...summary },
    { status: summary.claimFailed ? 500 : 200 }
  );
}

export const GET = handle;
export const POST = handle;
