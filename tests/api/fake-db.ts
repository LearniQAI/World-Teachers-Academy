// Tiny chainable fake of the Supabase client for route tests (service role and anon alike).
export const tables: Record<string, Record<string, unknown>[]> = { jobs: [], leads: [], email_otps: [], portal_sessions: [] };
type F = (r: Record<string, unknown>) => boolean;
const DEFAULTS: Record<string, () => Record<string, unknown>> = {
  email_otps: () => ({ attempts: 0, max_attempts: 5, consumed_at: null, expires_at: new Date(Date.now() + 10 * 60_000).toISOString(), marketing_opt_in: false }),
  portal_sessions: () => ({ revoked_at: null }),
  leads: () => ({ purpose: "job_apply_gate", marketing_opt_in: false }),
};
function q(table: string) {
  const filters: F[] = []; let op: "select" | "insert" | "update" = "select"; let payload: Record<string, unknown> | null = null;
  let range: [number, number] | null = null; let countMode = false; let cols: string | null = null;
  const api: Record<string, unknown> = {
    select: (c?: string, o?: { count?: string; head?: boolean }) => { if (o?.count) countMode = true; if (op === "select") cols = c ?? "*"; return api; },
    insert: (p: Record<string, unknown>) => { op = "insert"; payload = p; return api; },
    update: (p: Record<string, unknown>) => { op = "update"; payload = p; return api; },
    eq: (k: string, v: unknown) => { filters.push((r) => r[k] === v); return api; },
    neq: (k: string, v: unknown) => { filters.push((r) => r[k] !== v); return api; },
    in: (k: string, v: unknown[]) => { filters.push((r) => v.includes(r[k])); return api; },
    is: (k: string, v: unknown) => { filters.push((r) => (r[k] ?? null) === v); return api; },
    gt: (k: string, v: string) => { filters.push((r) => String(r[k]) > v); return api; },
    gte: (k: string, v: string) => { filters.push((r) => String(r[k]) >= v); return api; },
    or: () => api, order: () => api, limit: () => api,
    range: (a: number, b: number) => { range = [a, b]; return api; },
    single: () => run(true), maybeSingle: () => run(true),
    then: (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => run(false).then(res, rej),
  };
  async function run(one: boolean) {
    const rows = tables[table];
    if (op === "insert") { const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...(DEFAULTS[table]?.() ?? {}), ...payload! }; rows.push(row); return { data: row, error: null }; }
    let hit = rows.filter((r) => filters.every((f) => f(r)));
    if (op === "update") { hit.forEach((r) => Object.assign(r, payload)); return { data: hit.map((r) => ({ ...r })), error: null }; }
    // Mimic the column grant: the public listing must never ask for apply_url or "*".
    if (table === "jobs" && cols && (cols === "*" || /apply_url/.test(cols)) && !(globalThis as { __serviceCall?: boolean }).__serviceCall) {
      (globalThis as { __anonApplyUrlAttempt?: number }).__anonApplyUrlAttempt = ((globalThis as { __anonApplyUrlAttempt?: number }).__anonApplyUrlAttempt ?? 0) + 1;
    }
    const count = hit.length; if (range) hit = hit.slice(range[0], range[1] + 1);
    if (cols && cols !== "*") { const keep = cols.split(",").map((c) => c.trim()); hit = hit.map((r) => Object.fromEntries(keep.map((k) => [k, r[k]]))); }
    return one ? { data: hit[0] ?? null, error: null } : { data: hit, error: null, count: countMode ? count : null };
  }
  return api;
}
// The anon client may not read apply_url; the service client may. Track which is used.
export const supabaseAnon = { from: (t: string) => { (globalThis as { __serviceCall?: boolean }).__serviceCall = false; return q(t); } };
export const supabaseServiceRole = { from: (t: string) => { (globalThis as { __serviceCall?: boolean }).__serviceCall = true; return q(t); } };
