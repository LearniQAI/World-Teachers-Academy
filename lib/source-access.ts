// Which job sources sit behind the one-time verification.
//
//   "verified" — listed for everyone; opening the vacancy and its Apply link
//                needs the visitor's one-time verification.
//   "open"     — listed and opened without verification (with attribution).
//   "hidden"   — not shown at all.
//
// Adzuna is "open" until Adzuna confirms in writing whether its jobs may sit
// behind verification (their terms tie lead-generating use to a licence).
// Each source can be overridden with an environment variable, e.g.
// JOB_SOURCE_ACCESS_ADZUNA=hidden, without a code change.

export type SourceAccess = "verified" | "open" | "hidden";

const DEFAULTS: Record<string, SourceAccess> = {
  adzuna: "open",
  reed: "verified",
  teaching_vacancies: "verified",
  usajobs: "verified",
};

export function sourceAccess(source: string | null | undefined): SourceAccess {
  const key = (source ?? "").toLowerCase();
  const env = process.env[`JOB_SOURCE_ACCESS_${key.toUpperCase()}`];
  if (env === "verified" || env === "open" || env === "hidden") return env;
  return DEFAULTS[key] ?? "verified";
}

export function hiddenSources(): string[] {
  return Object.keys(DEFAULTS).filter((s) => sourceAccess(s) === "hidden");
}
