// LeadsMind CRM sync (lib/leadsmind.ts): field mapping, configuration,
// marketing-consent separation, retry/back-off, idempotency and log hygiene.
// No network is used: every request goes to a fake fetch, and the outbox is an
// in-memory stand-in for the leadsmind_outbox table.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ALERT_RETRY_MINUTES,
  alertBody,
  backoffMinutes,
  failureKind,
  maxAttemptsFor,
  probeDelayMinutes,
  planAlerts,
  resolveBackfillSince,
  type QueueHealth,
  buildSubmission,
  getLeadsMindConfig,
  LEADSMIND_MARKETING_CONSENT_FIELD,
  postToLeadsMind,
  processOutbox,
  splitName,
  type LeadForSync,
  type OutboxRow,
  type OutboxStore,
} from "../../lib/leadsmind.ts";

const NAME = "Testy McTestface Smith";
const EMAIL = "WTA-Sync-Test@Example.com";
const DEFAULT_FORM = "762edbd4-3d18-47c3-8d54-3c9209edf650";

const { config: baseConfig } = getLeadsMindConfig({});

// ---------- in-memory outbox ----------
type Row = OutboxRow & { status: string; next_attempt_at: Date; last_error: string | null; last_status_code: number | null };
function memoryStore(lead: LeadForSync | null, rows: Row[]) {
  const store: OutboxStore & { rows: Row[] } = {
    rows,
    async enqueue() {
      return null;
    },
    async claim({ limit, id }) {
      const now = new Date();
      const due = rows.filter((r) => r.status === "pending" && r.next_attempt_at <= now && (!id || r.id === id)).slice(0, limit);
      for (const r of due) {
        r.status = "sending";
        r.attempts++;
      }
      return due.map((r) => ({ ...r }));
    },
    async loadLead() {
      return lead;
    },
    async markSent(id, status) {
      const r = rows.find((x) => x.id === id)!;
      r.status = "sent";
      r.last_status_code = status;
      r.last_error = null;
    },
    async markFailed(id, f) {
      const r = rows.find((x) => x.id === id)!;
      r.status = f.dead ? "dead" : "pending";
      r.last_status_code = f.status;
      r.last_error = f.error;
      r.next_attempt_at = f.nextAttemptAt;
    },
  };
  return store;
}
function newRow(id = "row-1"): Row {
  return {
    id,
    lead_id: "lead-1",
    client_submission_id: "6f1c2a1e-1111-4a4a-8b8b-123456789abc",
    attempts: 0,
    status: "pending",
    next_attempt_at: new Date(0),
    last_error: null,
    last_status_code: null,
  };
}
function fakeFetch(statuses: (number | "network" | "timeout")[], seen: { url: string; body: unknown; headers: unknown }[] = []) {
  let i = 0;
  return (async (url: string, init: RequestInit) => {
    seen.push({ url, body: JSON.parse(String(init.body)), headers: init.headers });
    const s = statuses[Math.min(i++, statuses.length - 1)];
    if (s === "network") throw new TypeError("fetch failed");
    if (s === "timeout") throw new DOMException("timed out", "TimeoutError");
    // The body echoes the submitted email, like a real error page might.
    return new Response(JSON.stringify({ error: `rejected ${EMAIL}` }), { status: s });
  }) as unknown as typeof fetch;
}
function captureLogs() {
  const lines: string[] = [];
  const orig = { error: console.error, warn: console.warn, info: console.info, log: console.log };
  for (const k of Object.keys(orig) as (keyof typeof orig)[]) {
    console[k] = (...args: unknown[]) => lines.push(args.map(String).join(" "));
  }
  return {
    lines,
    restore() {
      Object.assign(console, orig);
    },
  };
}
const lead: LeadForSync = { name: NAME, email: EMAIL, jobTitle: "ESL Teacher - Seoul", jobId: "job-123" };

// ---------- configuration ----------
test("config: defaults point at the World Teachers Academy LeadsMind form", () => {
  const { config, problems } = getLeadsMindConfig({});
  assert.deepEqual(problems, []);
  assert.equal(config.enabled, true);
  assert.equal(config.formId, DEFAULT_FORM);
  assert.equal(config.baseUrl, "https://www.leadsmind.io");
  assert.equal(config.fields.email, "email_1795715249116_555");
});

test("config: form id, workspace and field mapping are overridable by env", () => {
  const { config } = getLeadsMindConfig({
    LEADSMIND_BASE_URL: "https://staging.example.com/",
    LEADSMIND_FORM_ID: "11111111-2222-4333-8444-555555555555",
    LEADSMIND_WORKSPACE_ID: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    LEADSMIND_FIELD_MAP: JSON.stringify({ firstName: "f1", lastName: "f2", email: "f3" }),
  });
  assert.equal(config.enabled, true);
  assert.equal(config.baseUrl, "https://staging.example.com");
  assert.equal(config.formId, "11111111-2222-4333-8444-555555555555");
  assert.deepEqual(config.fields, { firstName: "f1", lastName: "f2", email: "f3" });

  const single = getLeadsMindConfig({ LEADSMIND_FIELD_EMAIL: "email_x" }).config;
  assert.equal(single.fields.email, "email_x");
  assert.equal(single.fields.firstName, "text_1795715242334_143");
});

test("config: invalid settings disable the sync instead of sending to the wrong place", () => {
  for (const env of [
    { LEADSMIND_FORM_ID: "not-a-uuid" },
    { LEADSMIND_WORKSPACE_ID: "x" },
    { LEADSMIND_FIELD_MAP: "{bad json" },
    { LEADSMIND_FIELD_MAP: JSON.stringify({ firstName: "a" }) },
    { LEADSMIND_BASE_URL: "http://evil.example.com" },
  ]) {
    const { config, problems } = getLeadsMindConfig(env);
    assert.equal(config.enabled, false, JSON.stringify(env));
    assert.ok(problems.length > 0);
  }
  assert.equal(getLeadsMindConfig({ LEADSMIND_DISABLED: "true" }).config.enabled, false);
});

// ---------- mapping & consent ----------
test("mapping: full name splits into first/last; email normalised", () => {
  assert.deepEqual(splitName("  Ada  "), { first: "Ada", last: "" });
  assert.deepEqual(splitName("Ada Lovelace"), { first: "Ada", last: "Lovelace" });
  assert.deepEqual(splitName(NAME), { first: "Testy", last: "McTestface Smith" });
  const body = buildSubmission(lead, baseConfig, "csid");
  assert.deepEqual(body.data, {
    text_1795715242334_143: "Testy",
    text_1795715246161_465: "McTestface Smith",
    email_1795715249116_555: "wta-sync-test@example.com",
  });
  assert.equal(body.workspace_id, baseConfig.workspaceId);
  assert.equal(body.client_submission_id, "csid");
});

test("attribution: every lead is tagged with the job portal source and job", () => {
  const { attribution } = buildSubmission(lead, baseConfig, "csid");
  assert.equal(attribution.utm_source, "world-teachers-academy");
  assert.equal(attribution.utm_medium, "job-portal");
  assert.equal(attribution.utm_campaign, "ESL Teacher - Seoul");
  assert.equal(attribution.utm_content, "job-123");
  assert.equal(attribution.first_touch_source, "World Teachers Academy Job Portal");
  assert.match(attribution.first_touch_page, /job-portal/);
});

test("consent: email verification is never sent as marketing consent", () => {
  const body = buildSubmission(lead, baseConfig, "csid");
  assert.equal(LEADSMIND_MARKETING_CONSENT_FIELD in body.data, false);
  assert.equal(JSON.stringify(body).includes("consent"), false);
});

// ---------- HTTP ----------
test("http: 2xx is success, anything else is a retryable failure", async () => {
  const seen: { url: string; body: unknown; headers: unknown }[] = [];
  const body = buildSubmission(lead, baseConfig, "csid");
  assert.deepEqual(await postToLeadsMind(body, baseConfig, fakeFetch([200], seen)), { ok: true, status: 200 });
  assert.equal(seen[0].url, `https://www.leadsmind.io/api/public/forms/${DEFAULT_FORM}/submit`);
  assert.deepEqual(await postToLeadsMind(body, baseConfig, fakeFetch([500])), { ok: false, status: 500, error: "http_500" });
  assert.deepEqual(await postToLeadsMind(body, baseConfig, fakeFetch([429])), { ok: false, status: 429, error: "http_429" });
  assert.deepEqual(await postToLeadsMind(body, baseConfig, fakeFetch(["network"])), { ok: false, status: null, error: "network_TypeError" });
  assert.deepEqual(await postToLeadsMind(body, baseConfig, fakeFetch(["timeout"])), { ok: false, status: null, error: "timeout" });
});

test("backoff: 1, 2, 4 … minutes, capped at 12 hours", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(backoffMinutes), [1, 2, 4, 8, 16]);
  assert.equal(backoffMinutes(30), 720);
});

// ---------- outbox / failure recovery ----------
test("recovery: a failed send is kept, retried later with the SAME submission id, then marked sent", async () => {
  const logs = captureLogs();
  try {
    const store = memoryStore(lead, [newRow()]);
    const seen: { url: string; body: { client_submission_id?: string }; headers: unknown }[] = [];
    const fetchImpl = fakeFetch([503, "network", 200], seen);

    let s = await processOutbox(store, { config: baseConfig, fetchImpl });
    assert.deepEqual(s, { claimed: 1, sent: 0, retrying: 1, dead: 0 });
    assert.equal(store.rows[0].status, "pending");
    assert.equal(store.rows[0].last_error, "http_503");
    assert.ok(store.rows[0].next_attempt_at > new Date(), "next attempt is scheduled in the future");

    // Not due yet: nothing is sent.
    s = await processOutbox(store, { config: baseConfig, fetchImpl });
    assert.equal(s.claimed, 0);

    store.rows[0].next_attempt_at = new Date(0); // time passes
    s = await processOutbox(store, { config: baseConfig, fetchImpl });
    assert.equal(s.retrying, 1);
    assert.equal(store.rows[0].last_error, "network_TypeError");

    store.rows[0].next_attempt_at = new Date(0);
    s = await processOutbox(store, { config: baseConfig, fetchImpl });
    assert.deepEqual(s, { claimed: 1, sent: 1, retrying: 0, dead: 0 });
    assert.equal(store.rows[0].status, "sent");
    assert.equal(store.rows[0].attempts, 3);

    const ids = new Set(seen.map((x) => x.body.client_submission_id));
    assert.deepEqual([...ids], ["6f1c2a1e-1111-4a4a-8b8b-123456789abc"], "all attempts reuse one idempotency key");

    // Already sent: never sent again.
    s = await processOutbox(store, { config: baseConfig, fetchImpl });
    assert.equal(s.claimed, 0);
    assert.equal(seen.length, 3);
  } finally {
    logs.restore();
  }
});

test("recovery: after max attempts the row is kept as 'dead', not deleted", async () => {
  const logs = captureLogs();
  try {
    const config = { ...baseConfig, maxAttempts: 2 };
    const store = memoryStore(lead, [newRow()]);
    const fetchImpl = fakeFetch([500]);
    await processOutbox(store, { config, fetchImpl });
    store.rows[0].next_attempt_at = new Date(0);
    const s = await processOutbox(store, { config, fetchImpl });
    assert.equal(s.dead, 1);
    assert.equal(store.rows.length, 1);
    assert.equal(store.rows[0].status, "dead");
  } finally {
    logs.restore();
  }
});

test("automatic recovery: a successful send re-queues dead rows; no success, no revive", async () => {
  const logs = captureLogs();
  try {
    let revived = 0;
    const ok = memoryStore(lead, [newRow("a")]);
    ok.reviveDead = async () => { revived++; return 7; };
    const s1 = await processOutbox(ok, { config: baseConfig, fetchImpl: fakeFetch([200]) });
    assert.equal(s1.revived, 7);
    assert.equal(revived, 1);
    const down = memoryStore(lead, [newRow("b")]);
    down.reviveDead = async () => { revived++; return 7; };
    const s2 = await processOutbox(down, { config: baseConfig, fetchImpl: fakeFetch([503]) });
    assert.equal(s2.revived, undefined);
    assert.equal(revived, 1, "not called while LeadsMind still fails");
  } finally {
    logs.restore();
  }
});

test("rate limit: a 429 defers the rest of the batch and never marks rows dead", async () => {
  const logs = captureLogs();
  try {
    const config = { ...baseConfig, maxAttempts: 1 };
    const store = memoryStore(lead, [newRow("a"), newRow("b"), newRow("c")]);
    const seen: { url: string; body: unknown; headers: unknown }[] = [];
    const s = await processOutbox(store, { config, fetchImpl: fakeFetch([429], seen), limit: 10 });
    assert.equal(seen.length, 1, "stops sending after the first 429");
    assert.deepEqual(s, { claimed: 3, sent: 0, retrying: 3, dead: 0 });
    assert.deepEqual(store.rows.map((r) => r.status), ["pending", "pending", "pending"]);
    assert.deepEqual(store.rows.map((r) => r.last_error), ["http_429", "deferred_rate_limited", "deferred_rate_limited"]);
    for (const r of store.rows) {
      const wait = r.next_attempt_at.getTime() - Date.now();
      assert.ok(wait > 50_000 && wait <= 60_000, "retried in about a minute");
    }
  } finally {
    logs.restore();
  }
});

test("recovery: a store failure never throws to the caller", async () => {
  const logs = captureLogs();
  try {
    const store = memoryStore(lead, [newRow()]);
    store.claim = async () => {
      throw new Error("db down");
    };
    const s = await processOutbox(store, { config: baseConfig, fetchImpl: fakeFetch([200]) });
    assert.equal(s.claimed, 0);
    assert.equal(s.claimFailed, true);
    assert.equal(store.rows[0].status, "pending", "nothing is lost");
  } finally {
    logs.restore();
  }
});

test("disabled: no request is made when the sync is switched off", async () => {
  let calls = 0;
  const store = memoryStore(lead, [newRow()]);
  const fetchImpl = (async () => {
    calls++;
    return new Response("{}");
  }) as unknown as typeof fetch;
  await processOutbox(store, { config: { ...baseConfig, enabled: false }, fetchImpl });
  assert.equal(calls, 0);
  assert.equal(store.rows[0].status, "pending", "lead stays queued for when it is switched back on");
});

// ---------- logging ----------
test("logs: no name, email or response body is ever logged", async () => {
  const logs = captureLogs();
  try {
    for (const outcome of [500, "network", "timeout", 404] as const) {
      const store = memoryStore(lead, [newRow()]);
      await processOutbox(store, { config: baseConfig, fetchImpl: fakeFetch([outcome]) });
    }
    const noLead = memoryStore(null, [newRow()]);
    await processOutbox(noLead, { config: baseConfig, fetchImpl: fakeFetch([200]) });
  } finally {
    logs.restore();
  }
  assert.ok(logs.lines.length >= 5, "failures are logged");
  const all = logs.lines.join("\n").toLowerCase();
  for (const secret of ["testy", "mctestface", "wta-sync-test", "example.com", "rejected"]) {
    assert.equal(all.includes(secret), false, `log leaked "${secret}"`);
  }
});

// ---------- wiring (static checks on the route sources) ----------
const verifySrc = readFileSync(new URL("../../app/api/leads/verify/route.ts", import.meta.url), "utf8");
const requestCodeSrc = readFileSync(new URL("../../app/api/leads/request-code/route.ts", import.meta.url), "utf8");
const cronSrc = readFileSync(new URL("../../app/api/cron/leadsmind-retry/route.ts", import.meta.url), "utf8");

test("wiring: only verified applicants are queued (after the code matched and the lead was created)", () => {
  assert.equal(/leadsmind/i.test(requestCodeSrc), false, "request-code must not send anything to LeadsMind");
  const hashCheck = verifySrc.indexOf("hashCode(code) !== otp.code_hash");
  const consumed = verifySrc.indexOf("consumed_at: new Date()");
  const created = verifySrc.indexOf("await createLead(");
  const queued = verifySrc.indexOf("enqueueLeadForLeadsMind(result.id)");
  assert.ok(hashCheck > 0 && consumed > hashCheck && created > consumed && queued > created);
  // Delivery happens after the response, so the applicant's flow is unchanged.
  assert.match(verifySrc, /after\(async \(\) => \{[\s\S]*runLeadsMindOutbox/);
});

test("wiring: retry and admin endpoints fail closed and compare secrets in constant time", async () => {
  assert.match(cronSrc, /checkBearer\(request\.headers\.get\("authorization"\), process\.env\.CRON_SECRET\)/);
  assert.match(cronSrc, /"unconfigured"\) return NextResponse\.json\(\{ error: "Not configured" \}, \{ status: 503 \}/);
  const adminSrc = readFileSync(new URL("../../app/api/admin/leadsmind-outbox/route.ts", import.meta.url), "utf8");
  assert.match(adminSrc, /checkBearer\(request\.headers\.get\("authorization"\), process\.env\.LEADSMIND_ADMIN_SECRET\)/);
  assert.equal(/\b(name|email)\b/.test(adminSrc.match(/\.select\("([^"]+)"\)/)?.[1] ?? "x"), false, "admin list selects no name/email");
  const { checkBearer } = await import("../../lib/admin-auth.ts");
  assert.equal(checkBearer("Bearer s3cret", undefined), "unconfigured");
  assert.equal(checkBearer(null, "s3cret"), "unauthorized");
  assert.equal(checkBearer("Bearer wrong", "s3cret"), "unauthorized");
  assert.equal(checkBearer("Bearer s3cret", "s3cret"), "ok");
});

test("schedule: vercel.json runs the sync job every 2 minutes", () => {
  const vercel = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));
  assert.deepEqual(vercel.crons, [{ path: "/api/cron/leadsmind-retry", schedule: "*/2 * * * *" }]);
});

// ---------- F1: pausing never stops queueing ----------
const storeSrc = readFileSync(new URL("../../lib/leadsmind-store.ts", import.meta.url), "utf8");
function fnBody(src: string, name: string) {
  const start = src.indexOf(`export async function ${name}`);
  assert.ok(start >= 0, `${name} exists`);
  return src.slice(start, src.indexOf("\n}\n", start));
}

test("F1: queueing and catch-up ignore LEADSMIND_DISABLED (only delivery is paused)", () => {
  assert.equal(/enabled/.test(fnBody(storeSrc, "enqueueLeadForLeadsMind")), false);
  assert.equal(/enabled/.test(fnBody(storeSrc, "enqueueMissingLeads")), false);
  // Delivery itself stops while disabled (processOutbox early return), tested above in "disabled".
});

test("F1/F2: the sync job runs catch-up before delivery, and regardless of the pause switch", () => {
  const backfillAt = cronSrc.indexOf("enqueueMissingLeads(window.since)");
  const deliverAt = cronSrc.indexOf("runLeadsMindOutbox({ limit: 5 })");
  assert.ok(backfillAt > 0 && deliverAt > backfillAt);
  assert.equal(/if \(!?config\.enabled\)/.test(cronSrc), false, "no enabled-gate around catch-up");
});

// ---------- F2: recovery window ----------
test("F2: catch-up starts at go-live with no age limit", () => {
  const r = resolveBackfillSince("2026-12-01T08:00:00Z");
  assert.ok("since" in r && r.since.toISOString() === "2026-12-01T08:00:00.000Z");
  // a lead from a 30-day pause is still inside the window: nothing caps it
  assert.equal(/2 \* 24 \* 60 \* 60 \* 1000|twoDaysAgo/.test(cronSrc), false, "the old 2-day cap is gone");
});

test("F2: manual recovery cannot reach before go-live without explicit confirmation", () => {
  const start = "2026-12-01T08:00:00Z";
  assert.ok("since" in resolveBackfillSince(start, "2026-12-05T00:00:00Z"));
  assert.ok("error" in resolveBackfillSince(start, "2026-11-01T00:00:00Z"));
  assert.ok("since" in resolveBackfillSince(start, "2026-11-01T00:00:00Z", true));
  assert.ok("error" in resolveBackfillSince(undefined, null));
  assert.ok("error" in resolveBackfillSince(undefined, "2026-12-05T00:00:00Z"));
  assert.ok("error" in resolveBackfillSince("not-a-date"));
  assert.ok("error" in resolveBackfillSince(start, "garbage"));
});

test("F2: the admin endpoint offers a dry run and a real run, both behind the admin key", () => {
  const adminSrc = readFileSync(new URL("../../app/api/admin/leadsmind-outbox/route.ts", import.meta.url), "utf8");
  assert.match(adminSrc, /action === "backfill_preview"/);
  assert.match(adminSrc, /previewMissingLeads\(window\.since\)/);
  assert.match(adminSrc, /dry_run: true/);
  const guardAt = adminSrc.indexOf("const denied = guard(request);", adminSrc.indexOf("export async function POST"));
  assert.ok(guardAt > 0 && guardAt < adminSrc.indexOf('action === "backfill_preview"'));
});

// ---------- F3: alerts ----------
const okHealth: QueueHealth = {
  counts: { sent: 10 }, oldest_pending_at: null, stale_pending: 0, dead: 0, oldest_dead_at: null,
  last_sent_at: "2026-12-02T09:00:00Z", error_classes: {}, checked_at: "2026-12-02T10:00:00Z",
};
const badHealth: QueueHealth = {
  ...okHealth, counts: { sent: 10, pending: 3, dead: 2 }, stale_pending: 3, dead: 2,
  oldest_pending_at: "2026-12-02T06:00:00Z", error_classes: { http_503: 4, timeout: 1 },
};
const at = (iso: string) => new Date(iso);

test("F3: a critical alert is sent as soon as leads fail or wait over 2 hours", () => {
  const p = planAlerts(badHealth, [], [], at("2026-12-02T03:00:00Z"));
  assert.deepEqual(p.map((x) => x.kind), ["critical"]);
  assert.equal(p[0].fingerprint, "dead,stale");
  assert.match(p[0].text, /Failed permanently \(dead\): 2/);
  assert.match(p[0].text, /Waiting more than 2 hours: 3/);
  assert.match(p[0].text, /Last successful sync: 2026-12-02T09:00:00Z/);
});

test("F3: no flooding - the same problem is not re-alerted, a new kind of problem is (max once an hour)", () => {
  const sent = [{ kind: "critical" as const, fingerprint: "dead,stale", last_sent_at: "2026-12-02T03:00:00Z" }];
  assert.deepEqual(planAlerts(badHealth, [], sent, at("2026-12-02T03:30:00Z")).map((x) => x.kind), []);
  assert.deepEqual(planAlerts(badHealth, [], sent, at("2026-12-02T04:59:00Z")).map((x) => x.kind), []);
  const worse = planAlerts(badHealth, ["LEADSMIND_FORM_ID must be a UUID"], sent, at("2026-12-02T03:30:00Z"));
  assert.deepEqual(worse.map((x) => x.kind), [], "changed, but within the hour: held back");
  const later = planAlerts(badHealth, ["LEADSMIND_FORM_ID must be a UUID"], sent, at("2026-12-02T04:10:00Z"));
  assert.deepEqual(later.map((x) => x.kind), ["critical"]);
});

test("F3: never two emails in one run (new problem after 07:00 sends only the critical alert)", () => {
  assert.deepEqual(planAlerts(badHealth, [], [], at("2026-12-02T10:00:00Z")).map((x) => x.kind), ["critical"]);
});

test("F3: one daily summary while problems remain, from 07:00 Johannesburg time", () => {
  const sent = [{ kind: "critical" as const, fingerprint: "dead,stale", last_sent_at: "2026-12-02T03:00:00Z" }];
  assert.deepEqual(planAlerts(badHealth, [], sent, at("2026-12-02T04:59:00Z")).map((x) => x.kind), []);
  assert.deepEqual(planAlerts(badHealth, [], sent, at("2026-12-02T05:00:00Z")).map((x) => x.kind), ["daily_summary"]);
  const withDaily = [...sent, { kind: "daily_summary" as const, fingerprint: "dead,stale", last_sent_at: "2026-12-02T05:00:00Z" }];
  assert.deepEqual(planAlerts(badHealth, [], withDaily, at("2026-12-02T18:00:00Z")).map((x) => x.kind), []);
  assert.deepEqual(planAlerts(badHealth, [], withDaily, at("2026-12-03T05:00:00Z")).map((x) => x.kind), ["daily_summary"]);
});

test("F3: a single 'recovered' notice once everything clears, then silence", () => {
  const sent = [{ kind: "critical" as const, fingerprint: "dead,stale", last_sent_at: "2026-12-02T03:00:00Z" }];
  assert.deepEqual(planAlerts(okHealth, [], sent, at("2026-12-02T08:00:00Z")).map((x) => x.kind), ["resolved"]);
  const cleared = [{ kind: "critical" as const, fingerprint: "", last_sent_at: "2026-12-02T03:00:00Z" }];
  assert.deepEqual(planAlerts(okHealth, [], cleared, at("2026-12-02T09:00:00Z")).map((x) => x.kind), []);
  assert.deepEqual(planAlerts(okHealth, [], [], at("2026-12-02T09:00:00Z")).map((x) => x.kind), [], "healthy and never alerted: nothing");
});

test("F3: alert text holds statistics only - no names, emails or lead ids", () => {
  const text = alertBody(badHealth, [], at("2026-12-02T10:00:00Z"), "x");
  assert.equal(/@/.test(text), false);
  assert.equal(/[0-9a-f]{8}-[0-9a-f]{4}-/.test(text), false);
  assert.match(text, /Applicants are not affected/);
});

test("F3: an invalid alert address turns alerts off but never stops the sync", () => {
  const { config, problems } = getLeadsMindConfig({ LEADSMIND_ALERT_EMAIL: "not-an-email" });
  assert.equal(config.alertEmail, null);
  assert.equal(config.enabled, true);
  assert.deepEqual(problems, []);
  assert.equal(getLeadsMindConfig({ LEADSMIND_ALERT_EMAIL: " info@docssa.co.za " }).config.alertEmail, "info@docssa.co.za");
});

// ---------- Recovery without new applicants (probes) ----------
// A fuller in-memory queue mirroring the SQL functions (claim, claim_probe,
// revive_dead, defer_probes) with a controllable clock.
type QRow = { id: string; lead_id: string; client_submission_id: string; attempts: number; status: string; next: number; last_error: string | null };
function sqlLikeStore(rows: QRow[], clock: { t: number }, leadFor = (id: string) => (id === "gone" ? null : { name: "Probe Test", email: `p-${id}@example.com` })) {
  const store: OutboxStore & { rows: QRow[] } = {
    rows,
    async enqueue() { return null; },
    async claim({ limit }) {
      const due = rows.filter((r) => r.status === "pending" && r.next <= clock.t).slice(0, limit);
      due.forEach((r) => { r.status = "sending"; r.attempts++; });
      return due.map((r) => ({ ...r }));
    },
    async claimProbe() {
      const r = rows.filter((x) => x.status === "dead" && x.next <= clock.t && x.last_error !== "lead_not_found").sort((a, b) => a.next - b.next)[0];
      if (!r) return null;
      r.status = "sending"; r.attempts++;   // synchronous: a parallel run cannot take it too
      return { ...r };
    },
    async loadLead(id) { return leadFor(id); },
    async markSent(id) { const r = rows.find((x) => x.id === id)!; r.status = "sent"; r.last_error = null; },
    async markFailed(id, f) { const r = rows.find((x) => x.id === id)!; r.status = f.dead ? "dead" : "pending"; r.last_error = f.error; r.next = f.nextAttemptAt.getTime(); },
    async reviveDead(limit) {
      const d = rows.filter((r) => r.status === "dead" && r.last_error !== "lead_not_found").slice(0, limit);
      d.forEach((r) => { r.status = "pending"; r.attempts = 0; r.next = clock.t; });
      return d.length;
    },
    async deferProbes(until, same) {
      rows.filter((r) => r.status === "dead" && (same === null || r.last_error === same)).forEach((r) => { r.next = Math.max(r.next, until.getTime()); });
    },
  };
  return store;
}
const deadRows = (n: number, t0: number, err = "http_503"): QRow[] =>
  Array.from({ length: n }, (_, i) => ({ id: `d${i}`, lead_id: `L${i}`, client_submission_id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, attempts: 12, status: "dead", next: t0, last_error: err }));
function countingFetch(statusFor: () => number | "network") {
  const calls: string[] = [];
  const f = (async (_url: string, init: RequestInit) => {
    calls.push(JSON.parse(String(init.body)).client_submission_id);
    const st = statusFor();
    if (st === "network") throw new TypeError("fetch failed");
    return new Response("{}", { status: st });
  }) as unknown as typeof fetch;
  return { f, calls };
}

test("classification: outages are transient, rejections are permanent, deleted leads are gone", () => {
  for (const e of ["http_500", "http_502", "http_503", "http_429", "http_408", "timeout", "network_TypeError", "store_Error", "deferred_rate_limited"]) assert.equal(failureKind(e), "transient", e);
  for (const e of ["http_400", "http_401", "http_403", "http_404", "http_409", "http_410", "http_422"]) assert.equal(failureKind(e), "permanent", e);
  assert.equal(failureKind("lead_not_found"), "gone");
  assert.equal(maxAttemptsFor("permanent", 12), 3, "rejections give up after 3 tries, not 12");
  assert.equal(maxAttemptsFor("transient", 12), 12);
  assert.deepEqual([13, 14, 15, 16, 30].map((a) => probeDelayMinutes("transient", a, 12)), [60, 120, 240, 360, 360]);
  assert.equal(probeDelayMinutes("permanent", 13, 12), 1440);
  assert.equal(probeDelayMinutes("gone", 13, 12), null);
});

test("scenario: everything died in an outage, LeadsMind returns, NO new applicant - recovers on its own", async () => {
  const logs = captureLogs();
  try {
    const clock = { t: Date.parse("2026-12-02T10:00:00Z") };
    const store = sqlLikeStore(deadRows(40, clock.t), clock);
    const up = true;
    const { f, calls } = countingFetch(() => (up ? 200 : 503));
    const run = () => processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t), limit: 5 });
    const first = await run();                         // no pending rows at all, only dead ones
    assert.equal(first.claimed, 0);
    assert.equal(first.probe, "ok", "a probe ran although nobody applied");
    assert.equal(first.revived, 39, "the other dead rows were re-queued automatically");
    for (let i = 0; i < 12 && store.rows.some((r) => r.status !== "sent"); i++) { clock.t += 2 * 60_000; await run(); }
    assert.equal(store.rows.filter((r) => r.status === "sent").length, 40, "every lead delivered");
    assert.equal(new Set(calls).size, calls.length, "each lead sent exactly once (no duplicate submissions)");
    assert.equal(up, true);
  } finally { logs.restore(); }
});

test("bounded cost: a 3-day outage with 50 dead leads makes ~1 probe per interval, growing to 6 h", async () => {
  const logs = captureLogs();
  try {
    const clock = { t: Date.parse("2026-12-02T00:00:00Z") };
    const store = sqlLikeStore(deadRows(50, clock.t), clock);
    const { f, calls } = countingFetch(() => 503);
    for (let i = 0; i < (3 * 24 * 60) / 2; i++) {           // every 2 minutes for 3 days = 2,160 runs
      await processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t), limit: 5 });
      clock.t += 2 * 60_000;
    }
    // 1 h, 2 h, 4 h, then every 6 h: about 14 calls in 72 h, not thousands.
    assert.ok(calls.length <= 16, `LeadsMind was called ${calls.length} times`);
    assert.ok(calls.length >= 10, "it does keep trying");
    assert.equal(store.rows.filter((r) => r.status === "dead").length, 50, "nothing lost, nothing marked sent");
  } finally { logs.restore(); }
});

test("permanent errors are probed daily only, and a fixed configuration then recovers everything", async () => {
  const logs = captureLogs();
  try {
    const clock = { t: Date.parse("2026-12-02T00:00:00Z") };
    const store = sqlLikeStore(deadRows(10, clock.t, "http_404"), clock);
    let fixed = false;
    const { f, calls } = countingFetch(() => (fixed ? 200 : 404));
    const run = () => processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t), limit: 5 });
    for (let i = 0; i < 720; i++) { await run(); clock.t += 2 * 60_000; }    // 24 h of runs
    assert.ok(calls.length <= 2, `probed ${calls.length} times in a day`);
    fixed = true;                                                            // owner fixes the form
    for (let i = 0; i < 720 && store.rows.some((r) => r.status !== "sent"); i++) { await run(); clock.t += 2 * 60_000; }
    assert.equal(store.rows.filter((r) => r.status === "sent").length, 10, "recovered within the next daily probe");
  } finally { logs.restore(); }
});

test("deleted leads are never probed or revived", async () => {
  const logs = captureLogs();
  try {
    const clock = { t: Date.parse("2026-12-02T00:00:00Z") };
    const rows = deadRows(1, clock.t, "lead_not_found");
    const store = sqlLikeStore(rows, clock);
    const { f, calls } = countingFetch(() => 200);
    await processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t) });
    assert.equal(calls.length, 0);
    assert.equal(rows[0].status, "dead");
  } finally { logs.restore(); }
});

test("rate limit: a probe answered with 429 stays dead and waits 10 min; a rate-limited batch skips the probe", async () => {
  const logs = captureLogs();
  try {
    const clock = { t: Date.parse("2026-12-02T00:00:00Z") };
    const store = sqlLikeStore(deadRows(3, clock.t), clock);
    const { f, calls } = countingFetch(() => 429);
    const s1 = await processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t) });
    assert.equal(s1.probe, "rate_limited");
    assert.ok(store.rows.every((r) => r.status === "dead"));
    assert.ok(store.rows.every((r) => r.next >= clock.t + 10 * 60_000), "all dead rows wait for the next probe");
    const pending: QRow = { id: "p", lead_id: "P", client_submission_id: "00000000-0000-4000-8000-0000000000ff", attempts: 0, status: "pending", next: 0, last_error: null };
    const store2 = sqlLikeStore([pending, ...deadRows(2, 0)], { t: clock.t });
    const before = calls.length;
    const s2 = await processOutbox(store2, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t) });
    assert.equal(calls.length - before, 1, "the batch hit 429; no probe was added on top");
    assert.equal(s2.probe, undefined);
  } finally { logs.restore(); }
});

test("concurrency: six simultaneous runs never probe or send the same lead twice", async () => {
  const logs = captureLogs();
  try {
    const clock = { t: Date.parse("2026-12-02T00:00:00Z") };
    const store = sqlLikeStore(deadRows(5, clock.t), clock);
    const { f, calls } = countingFetch(() => 200);
    const runs = await Promise.all(Array.from({ length: 6 }, () => processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t), limit: 5 })));
    // Parallel runs may each probe a different dead lead; none probes the same one.
    assert.ok(runs.filter((r) => r.probe === "ok").length <= 5);
    for (let i = 0; i < 3; i++) { clock.t += 120_000; await processOutbox(store, { config: baseConfig, fetchImpl: f, now: () => new Date(clock.t), limit: 5 }); }
    assert.equal(new Set(calls).size, calls.length, "no lead sent twice");
    assert.equal(store.rows.filter((r) => r.status === "sent").length, 5);
  } finally { logs.restore(); }
});

test("alert send failures are retried, but not more than every 15 minutes", () => {
  const t = at("2026-12-02T10:00:00Z");
  const failed = [{ kind: "critical" as const, fingerprint: null, last_sent_at: null, last_attempt_at: "2026-12-02T09:50:00Z" }];
  assert.deepEqual(planAlerts(badHealth, [], failed, t).map((x) => x.kind), [], "attempted 10 min ago and failed: wait (no daily summary either)");
  const later = [{ ...failed[0], last_attempt_at: `2026-12-02T09:4${ALERT_RETRY_MINUTES === 15 ? "4" : "0"}:00Z` }];
  assert.deepEqual(planAlerts(badHealth, [], later, t).map((x) => x.kind), ["critical"], "16 min later: retry");
  const ok = [{ kind: "critical" as const, fingerprint: "dead,stale", last_sent_at: "2026-12-02T09:50:00Z", last_attempt_at: "2026-12-02T09:50:00Z" }];
  assert.equal(planAlerts(badHealth, [], ok, t).some((x) => x.kind === "critical"), false, "sent successfully: the critical alert is not repeated");
});
