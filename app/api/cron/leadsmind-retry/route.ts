import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase";
import { checkBearer } from "@/lib/admin-auth";
import { getLeadsMindConfig, resolveBackfillSince } from "@/lib/leadsmind";
import { enqueueMissingLeads, runLeadsMindAlerts, runLeadsMindOutbox } from "@/lib/leadsmind-store";

// LeadsMind sync job (docs/leadsmind-sync.md). Scheduled by vercel.json
// (Vercel Cron, production only). Vercel sends `Authorization: Bearer
// <CRON_SECRET>` automatically once CRON_SECRET is set; without it every call
// is refused. Each run, in order:
//   1. catch-up: queue every verified lead since LEADSMIND_SYNC_START that has
//      no queue row (leads from a pause or a rollback). No age limit. Runs even
//      while delivery is paused.
//   2. deliver due rows (skipped while LEADSMIND_DISABLED=true).
//   3. purge delivered rows older than LEADSMIND_RETENTION_DAYS.
//   4. alerts (LEADSMIND_ALERT_EMAIL).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(request: NextRequest) {
  const auth = checkBearer(request.headers.get("authorization"), process.env.CRON_SECRET);
  if (auth === "unconfigured") return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (auth === "unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { config } = getLeadsMindConfig();

  let backfilled = 0;
  let backfillError: string | null = null;
  if (process.env.LEADSMIND_SYNC_START) {
    const window = resolveBackfillSince(process.env.LEADSMIND_SYNC_START);
    if ("since" in window) {
      try {
        backfilled = await enqueueMissingLeads(window.since);
      } catch (err) {
        backfillError = "backfill_failed";
        console.error("[leadsmind-retry] backfill failed:", err instanceof Error ? err.message : "unknown");
      }
    } else {
      backfillError = "invalid_sync_start";
      console.error(`[leadsmind-retry] backfill skipped: ${window.error}`);
    }
  }

  // 5 per run matches LeadsMind's public limit of 5 submissions a minute per IP.
  const summary = await runLeadsMindOutbox({ limit: 5 });

  let purged = 0;
  const days = Number.parseInt(process.env.LEADSMIND_RETENTION_DAYS ?? "", 10);
  const { data: removed, error: purgeError } = await supabaseServiceRole.rpc("purge_sent_leadsmind_outbox", {
    p_days: Number.isFinite(days) ? days : 180,
  });
  if (purgeError) console.error("[leadsmind-retry] purge failed:", purgeError.code ?? "unknown");
  else purged = typeof removed === "number" ? removed : 0;

  const alerts = await runLeadsMindAlerts();

  console.info(
    `[leadsmind-retry] enabled=${config.enabled} backfilled=${backfilled} claimed=${summary.claimed} sent=${summary.sent} retrying=${summary.retrying} dead=${summary.dead} purged=${purged} alerts=${alerts.join("+") || "none"}`
  );
  const failed = !!summary.claimFailed || backfillError === "backfill_failed";
  return NextResponse.json(
    { ok: !failed, enabled: config.enabled, backfilled, backfillError, purged, alerts, ...summary },
    { status: failed ? 500 : 200 }
  );
}

export const GET = handle;
export const POST = handle;
