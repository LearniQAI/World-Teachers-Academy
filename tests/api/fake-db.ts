// Tiny chainable fake of the Supabase client for route tests.
export const tables: Record<string, Record<string, unknown>[]> = { jobs: [], leads: [], email_otps: [] };
type F = (r: Record<string, unknown>) => boolean;
function q(table: string) {
  const filters: F[] = []; let op: "select" | "insert" | "update" = "select"; let payload: Record<string, unknown> | null = null;
  let range: [number, number] | null = null; let countMode = false;
  const api: Record<string, unknown> = {
    select: (_c?: string, o?: { count?: string; head?: boolean }) => { if (o?.count) countMode = true; return api; },
    insert: (p: Record<string, unknown>) => { op = "insert"; payload = p; return api; },
    update: (p: Record<string, unknown>) => { op = "update"; payload = p; return api; },
    eq: (k: string, v: unknown) => { filters.push((r) => r[k] === v); return api; },
    neq: (k: string, v: unknown) => { filters.push((r) => r[k] !== v); return api; },
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
    if (op === "insert") { const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), attempts: 0, max_attempts: 5, ...payload! }; rows.push(row); return { data: row, error: null }; }
    let hit = rows.filter((r) => filters.every((f) => f(r)));
    if (op === "update") { hit.forEach((r) => Object.assign(r, payload)); return { data: hit, error: null }; }
    const count = hit.length; if (range) hit = hit.slice(range[0], range[1] + 1);
    return one ? { data: hit[0] ?? null, error: null } : { data: hit, error: null, count: countMode ? count : null };
  }
  return api;
}
const client = { from: (t: string) => q(t) };
export const supabaseServiceRole = client;
export const supabaseAnon = client;
