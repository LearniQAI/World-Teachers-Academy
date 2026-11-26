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
  };

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
}

export interface ProcessSummary {
  claimed: number;
  sent: number;
  retrying: number;
  dead: number;
  /** True when the queue itself could not be read (e.g. database down). */
  claimFailed?: boolean;
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

    let result: SendResult;
    try {
      const lead = await store.loadLead(row.lead_id);
      result = lead
        ? await postToLeadsMind(buildSubmission(lead, config, row.client_submission_id), config, opts.fetchImpl)
        : { ok: false, status: null, error: "lead_not_found" };
    } catch (err) {
      result = { ok: false, status: null, error: `store_${err instanceof Error ? err.name : "unknown"}`.slice(0, 60) };
    }

    try {
      if (result.ok) {
        await store.markSent(row.id, result.status);
        summary.sent++;
      } else {
        if (result.status === 429) rateLimited = true;
        const dead = row.attempts >= config.maxAttempts && result.status !== 429;
        const delayMinutes = result.status === 429 ? 1 : backoffMinutes(row.attempts);
        const nextAttemptAt = new Date(now().getTime() + delayMinutes * 60_000);
        await store.markFailed(row.id, { status: result.status, error: result.error, dead, nextAttemptAt });
        if (dead) summary.dead++;
        else summary.retrying++;
        console.warn(
          `[leadsmind] outbox ${row.id} attempt ${row.attempts} failed (${result.error})${dead ? " - giving up, kept as dead" : ""}`
        );
      }
    } catch (err) {
      // The lease on the row expires and it is retried; nothing is lost.
      console.error(`[leadsmind] could not update outbox ${row.id}:`, err instanceof Error ? err.name : "unknown");
    }
  }
  return summary;
}
