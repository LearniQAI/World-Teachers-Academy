// Safety checks every job function runs before touching the database.
//
// 1. JOBS_TARGET_PROJECT_REF must be set and must equal the project in
//    SUPABASE_URL. A function copied to the wrong project, or a schedule
//    pointing at the wrong URL, stops here instead of writing anything.
// 2. Only feeds listed in JOBS_FEEDS_ENABLED run (e.g. "adzuna,reed").
//    New feeds stay off until someone adds them to that list on purpose.
// 3. JOBS_DRY_RUN=1 fetches and normalises but writes nothing.

export type Env = { get(name: string): string | undefined };

export type GuardResult =
  | { ok: true; projectRef: string; feeds: Set<string>; dryRun: boolean }
  | { ok: false; reason: string };

export function projectRefFromUrl(url: string | undefined): string | null {
  const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url ?? "");
  if (m) return m[1];
  if (/^http:\/\/(127\.0\.0\.1|localhost|kong)(:\d+)?\/?$/.test(url ?? "")) return "local";
  return null;
}

export function checkEnvironment(env: Env): GuardResult {
  const ref = projectRefFromUrl(env.get("SUPABASE_URL"));
  const expected = env.get("JOBS_TARGET_PROJECT_REF");
  if (!ref) return { ok: false, reason: "SUPABASE_URL is not a recognised Supabase project URL" };
  if (!expected) return { ok: false, reason: "JOBS_TARGET_PROJECT_REF is not set" };
  if (expected !== ref) return { ok: false, reason: `project mismatch: running on ${ref}, configured for ${expected}` };
  const feeds = new Set((env.get("JOBS_FEEDS_ENABLED") ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  return { ok: true, projectRef: ref, feeds, dryRun: env.get("JOBS_DRY_RUN") === "1" };
}
