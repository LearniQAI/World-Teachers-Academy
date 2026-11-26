import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { enqueueMissingLeads, runLeadsMindOutbox } from "@/lib/leadsmind-store";

// Retries LeadsMind deliveries that failed (see lib/leadsmind.ts).
// Called on a schedule (pg_cron or Vercel Cron — docs/leadsmind-sync.md) with
//   Authorization: Bearer <CRON_SECRET>
// Without CRON_SECRET configured the route refuses every call.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handle(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  console.info(`[leadsmind-retry] backfilled=${backfilled} claimed=${summary.claimed} sent=${summary.sent} retrying=${summary.retrying} dead=${summary.dead}`);
  // 500 when the queue couldn't be read, so a scheduler/monitor sees the failure.
  return NextResponse.json({ ok: !summary.claimFailed, backfilled, ...summary }, { status: summary.claimFailed ? 500 : 200 });
}

export const GET = handle;
export const POST = handle;
