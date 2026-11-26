// LeadsMind CRM sync (lib/leadsmind.ts): field mapping, configuration,
// marketing-consent separation, retry/back-off, idempotency and log hygiene.
// No network is used: every request goes to a fake fetch, and the outbox is an
// in-memory stand-in for the leadsmind_outbox table.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  backoffMinutes,
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

test("wiring: retry endpoint refuses calls unless CRON_SECRET is configured and matches", () => {
  assert.match(cronSrc, /if \(!process\.env\.CRON_SECRET\)[\s\S]*status: 503/);
  assert.match(cronSrc, /timingSafeEqual/);
  assert.match(cronSrc, /status: 401/);
});
