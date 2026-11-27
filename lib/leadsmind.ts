// LeadsMind CRM sync for verified job-portal leads.
//
// Flow (see docs/leadsmind-sync.md):
//   1. /api/leads/verify confirms the 6-digit code and creates the `leads` row.
//   2. It queues the lead in `leadsmind_outbox` BEFORE answering the applicant,
//      so the lead can't be lost even if LeadsMind is down.
//   3. After the response is sent, the row is delivered to the LeadsMind form's
//      public submit endpoint (the same one the hosted form uses).
//   4. Failures are retried with back-off by /api/cron/leadsmind-retry and by
//      later verifications, until LeadsMind accepts the lead or the attempts run
//      out (status 'dead', kept for inspection).
//
// This file is deliberately free of Next.js and Supabase imports so it can be
// unit-tested directly with `node --test`. Database access goes through the
// `OutboxStore` interface; lib/leadsmind-store.ts is the Supabase version.
//
// Logging rule: never log a name, email, request body or response body. Only
// outbox ids, HTTP status codes and short error classes are logged.

export interface LeadsMindFieldMap {
  firstName: string;
  lastName: string;
  email: string;
}

export interface LeadsMindConfig {
  enabled: boolean;
  baseUrl: string;
  formId: string;
  workspaceId: string;
  fields: LeadsMindFieldMap;
  timeoutMs: number;
  maxAttempts: number;
  /** Where the lead came from, as shown on the LeadsMind contact/submission. */
  sourceLabel: string;
  sourcePage: string;
  /** Where sync alerts go (LEADSMIND_ALERT_EMAIL). Unset = no alert emails. */
  alertEmail: string | null;
}

// Defaults: the World Teachers Academy workspace's form
// https://www.leadsmind.io/public/forms/762edbd4-3d18-47c3-8d54-3c9209edf650
// ("Test 33": First Name, Last Name, Email Address). Every value can be
// overridden by environment variables — no code change needed to switch forms.
const DEFAULTS = {
  baseUrl: "https://www.leadsmind.io",
  formId: "762edbd4-3d18-47c3-8d54-3c9209edf650",
  workspaceId: "94d419d2-76c1-43fb-90ca-65f096a898ee",
  fields: {
    firstName: "text_1795715242334_143",
    lastName: "text_1795715246161_465",
    email: "email_1795715249116_555",
  },
  timeoutMs: 10_000,
  maxAttempts: 12,
  sourceLabel: "World Teachers Academy Job Portal",
  sourcePage: "https://worldteachers.academy/job-portal",
};

/** LeadsMind's reserved marketing-consent key. We never send it (see below). */
export const LEADSMIND_MARKETING_CONSENT_FIELD = "lm_email_marketing_consent";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELD_ID_RE = /^[A-Za-z0-9_-]{1,100}$/;

function intFromEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

/**
 * Reads the sync settings from the environment.
 *
 * LEADSMIND_FIELD_MAP (JSON) overrides all three field ids at once, e.g.
 *   {"firstName":"text_…","lastName":"text_…","email":"email_…"}
 * otherwise LEADSMIND_FIELD_FIRST_NAME / _LAST_NAME / _EMAIL, otherwise the
 * defaults above. Invalid settings disable the sync (and say why) rather than
 * sending leads to the wrong place.
 */
export function getLeadsMindConfig(env: Record<string, string | undefined> = process.env): {
  config: LeadsMindConfig;
  problems: string[];
} {
  const problems: string[] = [];

  let fields: LeadsMindFieldMap = {
    firstName: env.LEADSMIND_FIELD_FIRST_NAME || DEFAULTS.fields.firstName,
    lastName: env.LEADSMIND_FIELD_LAST_NAME || DEFAULTS.fields.lastName,
    email: env.LEADSMIND_FIELD_EMAIL || DEFAULTS.fields.email,
  };
  if (env.LEADSMIND_FIELD_MAP) {
    try {
      const parsed = JSON.parse(env.LEADSMIND_FIELD_MAP);
      fields = { firstName: parsed.firstName, lastName: parsed.lastName, email: parsed.email };
    } catch {
      problems.push("LEADSMIND_FIELD_MAP is not valid JSON");
    }
  }

  const config: LeadsMindConfig = {
    enabled: env.LEADSMIND_DISABLED !== "true",
    baseUrl: (env.LEADSMIND_BASE_URL || DEFAULTS.baseUrl).replace(/\/+$/, ""),
    formId: env.LEADSMIND_FORM_ID || DEFAULTS.formId,
    workspaceId: env.LEADSMIND_WORKSPACE_ID || DEFAULTS.workspaceId,
    fields,
    timeoutMs: intFromEnv(env.LEADSMIND_TIMEOUT_MS, DEFAULTS.timeoutMs, 1_000, 30_000),
    maxAttempts: intFromEnv(env.LEADSMIND_MAX_ATTEMPTS, DEFAULTS.maxAttempts, 1, 50),
    sourceLabel: env.LEADSMIND_SOURCE_LABEL || DEFAULTS.sourceLabel,
    sourcePage: env.LEADSMIND_SOURCE_PAGE || DEFAULTS.sourcePage,
    alertEmail: env.LEADSMIND_ALERT_EMAIL?.trim() || null,
  };
  // An invalid alert address only turns alerts off; it must never stop the sync.
  if (config.alertEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.alertEmail)) config.alertEmail = null;

  if (!/^https:\/\/[^/]+$/.test(config.baseUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(config.baseUrl)) {
    problems.push("LEADSMIND_BASE_URL must be an https origin");
  }
  if (!UUID_RE.test(config.formId)) problems.push("LEADSMIND_FORM_ID must be a UUID");
  if (!UUID_RE.test(config.workspaceId)) problems.push("LEADSMIND_WORKSPACE_ID must be a UUID");
  for (const [key, id] of Object.entries(config.fields)) {
    if (typeof id !== "string" || !FIELD_ID_RE.test(id)) problems.push(`field id for ${key} is missing or invalid`);
  }
  if (problems.length) config.enabled = false;
  return { config, problems };
}

export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts.shift() ?? "";
  return { first, last: parts.join(" ") };
}

export interface LeadForSync {
  name: string;
  email: string;
  jobTitle?: string | null;
  jobId?: string | null;
}

/** Builds the exact JSON body the LeadsMind public submit endpoint expects. */
export function buildSubmission(lead: LeadForSync, config: LeadsMindConfig, clientSubmissionId: string) {
  const { first, last } = splitName(lead.name);
  const attribution: Record<string, string> = {
    utm_source: "world-teachers-academy",
    utm_medium: "job-portal",
    referrer: config.sourcePage,
    landing_page: config.sourcePage,
    first_touch_source: config.sourceLabel,
    first_touch_page: config.sourcePage,
  };
  if (lead.jobTitle) attribution.utm_campaign = lead.jobTitle.slice(0, 200);
  if (lead.jobId) attribution.utm_content = lead.jobId;

  return {
    // Only the mapped form fields. The marketing-consent key
    // (LEADSMIND_MARKETING_CONSENT_FIELD) is intentionally NOT sent: passing
    // the email-verification step is not consent to marketing.
    data: {
      [config.fields.firstName]: first,
      [config.fields.lastName]: last,
      [config.fields.email]: lead.email.trim().toLowerCase(),
    },
    workspace_id: config.workspaceId,
    steps_completed: 1,
    attribution,
    is_returning: false,
    client_submission_id: clientSubmissionId,
  };
}

export type SendResult =
  | { ok: true; status: number }
  | { ok: false; status: number | null; error: string };

export async function postToLeadsMind(
  body: ReturnType<typeof buildSubmission>,
  config: LeadsMindConfig,
  fetchImpl: typeof fetch = fetch
): Promise<SendResult> {
  try {
    const res = await fetchImpl(`${config.baseUrl}/api/public/forms/${config.formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: config.sourcePage },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    // Drain the body without keeping it: it could echo submitted data.
    await res.text().catch(() => "");
    if (res.ok) return { ok: true, status: res.status };
    return { ok: false, status: res.status, error: `http_${res.status}` };
  } catch (err) {
    const name = err instanceof Error ? err.name : "unknown";
    return { ok: false, status: null, error: name === "TimeoutError" ? "timeout" : `network_${name}`.slice(0, 60) };
  }
}

/** Minutes to wait before attempt n+1: 1, 2, 4, 8 … capped at 12 hours. */
export function backoffMinutes(attempts: number): number {
  return Math.min(2 ** Math.max(attempts - 1, 0), 12 * 60);
}

/**
 * Why a send failed (mirrored in SQL by public.leadsmind_failure_kind):
 * - transient: LeadsMind or the network was unavailable (5xx, 408, 429,
 *   timeouts, network errors, our own database hiccups). Retried with backoff,
 *   then probed (1 h, 2 h, 4 h, capped at 6 h) and revived automatically.
 * - config: the form or access is wrong on the LeadsMind side (401, 403, 404,
 *   405, 410 and other 4xx not listed under invalid): unpublished or deleted
 *   form, wrong form id, access refused. The same for every applicant, so it is
 *   not the applicant's fault: retried 3 times, then probed like an outage and
 *   revived automatically once any delivery succeeds again.
 * - invalid: LeadsMind rejected this applicant's data (400, 409, 413, 422).
 *   Retried 3 times, then probed once a day for at most a week, never revived
 *   by other rows' success, then left for a person (admin "retry").
 * - gone: the lead no longer exists. Never retried.
 */
export type FailureKind = "transient" | "config" | "invalid" | "gone";
const INVALID_STATUSES = new Set([400, 409, 413, 422]);
export function failureKind(error: string | null | undefined): FailureKind {
  if (error === "lead_not_found") return "gone";
  const m = /^http_(\d{3})$/.exec(error ?? "");
  if (m) {
    const code = Number(m[1]);
    if (code === 408 || code === 429 || code >= 500) return "transient";
    if (INVALID_STATUSES.has(code)) return "invalid";
    if (code >= 400) return "config";
  }
  return "transient";
}

/** Attempts before a row is marked dead: rejections give up early. */
export function maxAttemptsFor(kind: FailureKind, configured: number): number {
  if (kind === "gone") return 1;
  return kind === "transient" ? configured : Math.min(3, configured);
}

/** Daily recovery probes for invalid applicant data before giving up for good. */
export const INVALID_MAX_PROBES = 7;

/**
 * Wait before the next recovery probe, or null for never.
 * - transient and config: 1 h after a row dies, then 2 h, 4 h, capped at 6 h
 *   while probes keep failing (attempts counts every try, so it keeps growing).
 * - invalid: daily, at most INVALID_MAX_PROBES times, then never.
 * - gone: never.
 * `maxAttempts` is the configured LEADSMIND_MAX_ATTEMPTS.
 */
export function probeDelayMinutes(kind: FailureKind, attempts = 0, maxAttempts = 12): number | null {
  if (kind === "gone") return null;
  const limit = maxAttemptsFor(kind, maxAttempts);
  if (kind === "invalid") return attempts - limit < INVALID_MAX_PROBES ? 24 * 60 : null;
  const failedProbes = Math.max(0, attempts - limit - 1);
  return Math.min(60 * 2 ** failedProbes, 6 * 60);
}

export interface OutboxRow {
  id: string;
  lead_id: string;
  client_submission_id: string;
  attempts: number;
}

export interface OutboxStore {
  enqueue(leadId: string, formId: string): Promise<string | null>;
  claim(opts: { limit: number; id?: string | null }): Promise<OutboxRow[]>;
  loadLead(leadId: string): Promise<LeadForSync | null>;
  markSent(id: string, status: number): Promise<void>;
  markFailed(id: string, opts: { status: number | null; error: string; dead: boolean; nextAttemptAt: Date }): Promise<void>;
  /**
   * Puts 'dead' rows back in the queue after a successful delivery: only rows
   * that failed for a reason that affects everyone (transient or config), never
   * invalid applicant data or deleted leads.
   */
  reviveDead?(limit: number): Promise<number>;
  /**
   * Claims at most ONE dead row whose recovery probe is due (status 'dead',
   * next_attempt_at passed, not a deleted lead). Atomic: concurrent runs never
   * get the same row.
   */
  claimProbe?(): Promise<OutboxRow | null>;
  /**
   * After a failed probe: no other dead row is probed before `until` (all dead
   * rows for an outage; rows with the same error for a configuration error).
   * Keeps probing to one call per interval however many rows are dead.
   */
  deferProbes?(until: Date, sameErrorOnly: string | null): Promise<void>;
}

export interface ProcessSummary {
  claimed: number;
  sent: number;
  retrying: number;
  dead: number;
  /** True when the queue itself could not be read (e.g. database down). */
  claimFailed?: boolean;
  /** Dead rows re-queued because LeadsMind accepted a lead again in this run. */
  revived?: number;
  /** A recovery probe on a dead row ran in this run: "ok" or the error class. */
  probe?: string;
}

type DeliveryOutcome = "sent" | "retrying" | "dead" | "rate_limited";

async function deliverRow(
  store: OutboxStore,
  row: OutboxRow,
  config: LeadsMindConfig,
  now: () => Date,
  fetchImpl: typeof fetch | undefined,
  isProbe: boolean
): Promise<DeliveryOutcome> {
  let result: SendResult;
  try {
    const lead = await store.loadLead(row.lead_id);
    result = lead
      ? await postToLeadsMind(buildSubmission(lead, config, row.client_submission_id), config, fetchImpl)
      : { ok: false, status: null, error: "lead_not_found" };
  } catch (err) {
    result = { ok: false, status: null, error: `store_${err instanceof Error ? err.name : "unknown"}`.slice(0, 60) };
  }

  try {
    if (result.ok) {
      await store.markSent(row.id, result.status);
      return "sent";
    }
    const kind = failureKind(result.error);
    const rateLimited = result.status === 429;
    // A probe that fails puts the row straight back to 'dead' with its next
    // probe time; normal rows become dead after maxAttemptsFor(kind).
    const dead = !rateLimited && (isProbe || row.attempts >= maxAttemptsFor(kind, config.maxAttempts));
    let delayMinutes = rateLimited ? 1 : backoffMinutes(row.attempts);
    const probeDelay = dead ? probeDelayMinutes(kind, row.attempts, config.maxAttempts) : undefined;
    if (dead) delayMinutes = probeDelay ?? 100 * 365 * 24 * 60; // gone / invalid after its last probe: never again
    if (isProbe && rateLimited) delayMinutes = 10;
    const nextAttemptAt = new Date(now().getTime() + delayMinutes * 60_000);
    await store.markFailed(row.id, {
      status: result.status,
      error: result.error,
      dead: dead || (isProbe && rateLimited),
      nextAttemptAt,
    });
    // One failed probe speaks for the others: an outage holds back every dead
    // row, a configuration error the rows with the same error. Invalid data is
    // specific to one applicant, so it holds back nothing else.
    if (isProbe && (kind === "transient" || kind === "config") && store.deferProbes) {
      await store.deferProbes(nextAttemptAt, kind === "config" ? result.error : null);
    }
    console.warn(
      `[leadsmind] outbox ${row.id} ${isProbe ? "recovery probe" : `attempt ${row.attempts}`} failed (${result.error}, ${kind})${dead ? (probeDelay === null ? " - dead, no further automatic tries" : ` - dead, next probe in ${delayMinutes} min`) : ""}`
    );
    if (rateLimited) return "rate_limited";
    return dead ? "dead" : "retrying";
  } catch (err) {
    // The lease on the row expires and it is retried; nothing is lost.
    console.error(`[leadsmind] could not update outbox ${row.id}:`, err instanceof Error ? err.name : "unknown");
    return "retrying";
  }
}

/** Delivers due outbox rows. Never throws; returns counts for logging/tests. */
export async function processOutbox(
  store: OutboxStore,
  opts: { limit?: number; id?: string | null; config?: LeadsMindConfig; fetchImpl?: typeof fetch; now?: () => Date } = {}
): Promise<ProcessSummary> {
  const summary: ProcessSummary = { claimed: 0, sent: 0, retrying: 0, dead: 0 };
  const config = opts.config ?? getLeadsMindConfig().config;
  if (!config.enabled) return summary;
  const now = opts.now ?? (() => new Date());

  let rows: OutboxRow[];
  try {
    rows = await store.claim({ limit: opts.limit ?? 10, id: opts.id ?? null });
  } catch (err) {
    console.error("[leadsmind] could not claim outbox rows:", err instanceof Error ? err.message : "unknown");
    return { ...summary, claimFailed: true };
  }
  summary.claimed = rows.length;

  // LeadsMind's public endpoint allows ~5 submissions per minute per sending
  // IP and form, and every lead here comes from our server. Once it answers
  // 429, the rest of this batch is put back for a minute instead of being
  // sent into the same limit; rate-limited rows never count towards 'dead'.
  let rateLimited = false;

  for (const row of rows) {
    if (rateLimited) {
      try {
        await store.markFailed(row.id, {
          status: null,
          error: "deferred_rate_limited",
          dead: false,
          nextAttemptAt: new Date(now().getTime() + 60_000),
        });
        summary.retrying++;
      } catch {
        // Lease expiry releases it.
      }
      continue;
    }
    const outcome = await deliverRow(store, row, config, now, opts.fetchImpl, false);
    if (outcome === "sent") summary.sent++;
    else if (outcome === "dead") summary.dead++;
    else {
      summary.retrying++;
      if (outcome === "rate_limited") rateLimited = true;
    }
  }

  // Recovery probe: even when no new lead arrives, one dead row whose probe
  // time has come is tried per run (1-6 h for outages and configuration
  // errors, daily for at most a week for invalid applicant data). Skipped once LeadsMind has rate-limited us
  // or when this run targets one specific row.
  if (!rateLimited && !opts.id && store.claimProbe) {
    try {
      const probeRow = await store.claimProbe();
      if (probeRow) {
        const outcome = await deliverRow(store, probeRow, config, now, opts.fetchImpl, true);
        summary.probe = outcome === "sent" ? "ok" : outcome;
        if (outcome === "sent") summary.sent++;
      }
    } catch (err) {
      console.error("[leadsmind] recovery probe failed to start:", err instanceof Error ? err.name : "unknown");
    }
  }

  // LeadsMind is accepting leads again (so it is up and the form is published
  // and reachable): give rows that died of an outage or a configuration error
  // a fresh start, without anyone pressing "retry dead". Invalid applicant
  // data and deleted leads are never revived here (see failureKind).
  if (summary.sent > 0 && store.reviveDead) {
    try {
      summary.revived = await store.reviveDead(100);
      if (summary.revived) console.info(`[leadsmind] LeadsMind reachable again: ${summary.revived} dead rows re-queued`);
    } catch (err) {
      console.error("[leadsmind] could not re-queue dead rows:", err instanceof Error ? err.name : "unknown");
    }
  }
  return summary;
}

// ---------------------------------------------------------------------------
// F2: recovery (backfill) window
// ---------------------------------------------------------------------------

/**
 * Works out from when verified leads may be (re)queued. LEADSMIND_SYNC_START
 * (the go-live time) is the floor: leads from before go-live are never sent
 * unless the admin explicitly asks with allowBeforeGoLive. There is no other
 * age limit, so applicants who verified during a long pause or a rollback are
 * always recovered.
 */
export function resolveBackfillSince(
  syncStart: string | undefined,
  requested?: string | null,
  allowBeforeGoLive = false
): { since: Date } | { error: string } {
  const start = syncStart ? new Date(syncStart) : null;
  if (start && Number.isNaN(start.getTime())) return { error: "LEADSMIND_SYNC_START is not a valid date" };
  if (!requested) {
    return start ? { since: start } : { error: "LEADSMIND_SYNC_START is not set and no start date was given" };
  }
  const since = new Date(requested);
  if (Number.isNaN(since.getTime())) return { error: "since is not a valid date" };
  if (start && since < start && !allowBeforeGoLive) {
    return { error: "since is before go-live (LEADSMIND_SYNC_START); pass allow_before_go_live to confirm" };
  }
  if (!start && !allowBeforeGoLive) {
    return { error: "LEADSMIND_SYNC_START is not set; pass allow_before_go_live to confirm the start date" };
  }
  return { since };
}

// ---------------------------------------------------------------------------
// F3: alerts
// ---------------------------------------------------------------------------

export interface QueueHealth {
  counts: Record<string, number>;
  oldest_pending_at: string | null;
  stale_pending: number;
  dead: number;
  oldest_dead_at: string | null;
  last_sent_at: string | null;
  error_classes: Record<string, number>;
  checked_at: string;
}

export interface AlertStateRow {
  kind: "critical" | "daily_summary" | "resolved";
  fingerprint: string | null;
  last_sent_at: string | null;
  /** Last attempt to send (successful or not). */
  last_attempt_at?: string | null;
}

/** A failed alert send is retried, but not more often than this. */
export const ALERT_RETRY_MINUTES = 15;

function recentlyFailed(row: AlertStateRow | undefined, now: Date): boolean {
  if (!row?.last_attempt_at) return false;
  const attempt = new Date(row.last_attempt_at).getTime();
  const sent = row.last_sent_at ? new Date(row.last_sent_at).getTime() : 0;
  return attempt > sent && now.getTime() - attempt < ALERT_RETRY_MINUTES * 60_000;
}

export interface PlannedAlert {
  kind: AlertStateRow["kind"];
  fingerprint: string;
  subject: string;
  text: string;
}

const HOUR = 60 * 60 * 1000;

function age(fromIso: string | null, now: Date): string {
  if (!fromIso) return "n/a";
  const mins = Math.max(0, Math.round((now.getTime() - new Date(fromIso).getTime()) / 60000));
  return mins < 120 ? `${mins} min` : `${Math.round(mins / 60)} h`;
}

/** Plain-text body with queue statistics only: no names, emails or lead ids. */
export function alertBody(h: QueueHealth, problems: string[], now: Date, headline: string): string {
  const counts = ["pending", "sending", "sent", "dead"].map((s) => `${s}: ${h.counts?.[s] ?? 0}`).join(", ");
  const errors = Object.entries(h.error_classes ?? {}).map(([k, v]) => `${k} x${v}`).join(", ") || "none";
  return [
    headline,
    "",
    `Queue: ${counts}`,
    `Failed permanently (dead): ${h.dead}`,
    `Waiting more than 2 hours: ${h.stale_pending} (oldest waiting ${age(h.oldest_pending_at, now)})`,
    `Last successful sync: ${h.last_sent_at ?? "never"} (${age(h.last_sent_at, now)} ago)`,
    `Error types: ${errors}`,
    problems.length ? `Configuration problems: ${problems.join("; ")}` : "Configuration: OK",
    "",
    "Applicants are not affected: they can still apply. Leads wait in the queue and are retried automatically.",
    "Details: /api/admin/leadsmind-outbox (admin key required). Manual retry: action retry_dead.",
    `Checked at ${now.toISOString()}.`,
  ].join("\n");
}

/**
 * Decides which alert emails to send now. Pure, so it is unit-tested.
 * - critical: as soon as a problem category appears (dead rows, leads waiting
 *   over 2 h, or invalid configuration). Repeated only when the set of
 *   categories changes, and never more than once an hour.
 * - daily_summary: once per 23 h while any problem remains, from 07:00
 *   Johannesburg time (05:00 UTC).
 * - resolved: once, when all problems have cleared after a critical alert.
 */
export function planAlerts(
  h: QueueHealth,
  problems: string[],
  state: AlertStateRow[],
  now: Date
): PlannedAlert[] {
  const byKind = new Map(state.map((s) => [s.kind, s]));
  const categories = [h.dead > 0 ? "dead" : "", h.stale_pending > 0 ? "stale" : "", problems.length ? "config" : ""]
    .filter(Boolean)
    .join(",");
  const out: PlannedAlert[] = [];
  const critical = byKind.get("critical");
  // Any alert send that failed in the last 15 minutes pauses ALL alert kinds:
  // the mail service is probably failing, so don't hammer it every 2 minutes.
  if (state.some((row) => recentlyFailed(row, now))) return [];
  const hold = (k: AlertStateRow["kind"]) => recentlyFailed(byKind.get(k), now);
  const lastCritical = critical?.last_sent_at ? new Date(critical.last_sent_at).getTime() : 0;

  if (categories) {
    const changed = (critical?.fingerprint ?? "") !== categories;
    if (changed && now.getTime() - lastCritical >= HOUR && !hold("critical")) {
      out.push({
        kind: "critical",
        fingerprint: categories,
        subject: `[WTA job portal] LeadsMind sync needs attention (${categories})`,
        text: alertBody(h, problems, now, "Some verified applicants have not reached LeadsMind yet."),
      });
    }
    const daily = byKind.get("daily_summary");
    const lastDaily = daily?.last_sent_at ? new Date(daily.last_sent_at).getTime() : 0;
    // Not in the same run as a critical alert: one email per run at most.
    if (out.length === 0 && now.getUTCHours() >= 5 && now.getTime() - lastDaily >= 23 * HOUR && !hold("daily_summary")) {
      out.push({
        kind: "daily_summary",
        fingerprint: categories,
        subject: "[WTA job portal] Daily LeadsMind sync summary: unresolved items",
        text: alertBody(h, problems, now, "Daily summary of unresolved LeadsMind sync items."),
      });
    }
  } else if (critical?.fingerprint && !hold("resolved")) {
    out.push({
      kind: "resolved",
      fingerprint: "",
      subject: "[WTA job portal] LeadsMind sync recovered",
      text: alertBody(h, problems, now, "All earlier LeadsMind sync problems have cleared."),
    });
  }
  return out;
}
