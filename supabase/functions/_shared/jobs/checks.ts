// What each provider allows, and how a check's HTTP result becomes an outcome
// for record_check(). Pure functions, unit-tested in tests/unit/checks.test.ts.
//
// The database is the final safety net (it refuses Adzuna link checks and
// refuses "gone" from anything but an official API); this file decides what
// the verification worker even attempts.

export type Outcome = "confirmed_open" | "listed" | "gone" | "not_found" | "transient" | "blocked" | "unsupported";

export type ProviderPolicy = {
  /** Shown to visitors next to each listing. */
  label: string;
  /** Per-job lookup through the provider's official API. */
  sourceApiCheck: boolean;
  /** Automated request to the apply link. Off until the provider's terms are confirmed. */
  linkCheck: boolean;
  /** Attribution that must appear with each listing (null = none required). */
  attribution: { text: string; href: string; minWidthPx?: number; minHeightPx?: number } | null;
  /** Notes for the owner; not shown to visitors. */
  notes: string;
};

export const PROVIDERS: Record<string, ProviderPolicy> = {
  adzuna: {
    label: "Adzuna",
    sourceApiCheck: false, // no per-job endpoint in the API
    linkCheck: false, // terms forbid contacting third-party content providers; redirect links are tracked clicks
    attribution: { text: "Jobs by Adzuna", href: "https://www.adzuna.co.uk", minWidthPx: 116, minHeightPx: 23 },
    notes: "Freshness comes only from the daily feed (2 complete misses → removed). Licence needed for lead-generating use.",
  },
  reed: {
    label: "Reed",
    sourceApiCheck: true, // GET /api/1.0/jobs/{id}: expirationDate
    linkCheck: false,
    attribution: null,
    notes: "Detail lookups use the same API key and allowance as the import; checks run at most once a day per job.",
  },
  teaching_vacancies: {
    label: "Teaching Vacancies (Department for Education)",
    sourceApiCheck: false, // feed only; every record carries validThrough
    linkCheck: false, // enable only after DfE confirms automated checks are acceptable
    attribution: {
      text: "Contains public sector information licensed under the Open Government Licence v3.0",
      href: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    },
    notes: "Closing dates are reliable; expiry handles removal. Must not charge fees for contacting/hiring respondents.",
  },
  usajobs: {
    label: "USAJOBS",
    sourceApiCheck: true, // search by ControlNumber returns only open announcements
    linkCheck: false,
    attribution: null,
    notes: "Show 'Who may apply' prominently; many posts are for federal employees or veterans only.",
  },
};

export function sourcesForVerification(): string[] {
  return Object.entries(PROVIDERS).filter(([, p]) => p.sourceApiCheck || p.linkCheck).map(([k]) => k);
}

/** Network errors, timeouts, rate limits and server errors are never evidence that a job is gone. */
export function classifyHttp(status: number | null): Outcome | null {
  if (status === null) return "transient"; // network error / timeout
  if (status === 429 || status === 408 || status >= 500) return "transient";
  if (status === 401 || status === 403) return "blocked"; // our key or access problem, or robots/WAF
  if (status === 404 || status === 410) return "not_found";
  if (status >= 200 && status < 300) return null; // caller decides from the body
  return "transient"; // anything unexpected: retry later, do not hide
}

/** Reed GET /jobs/{id}. A past expirationDate is the official "closed" signal. */
export function reedOutcome(status: number | null, body: { expirationDate?: string } | null, now = new Date()):
  { outcome: Outcome; detail?: Record<string, unknown> } {
  const c = classifyHttp(status);
  if (c) return { outcome: c };
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(body?.expirationDate ?? "");
  if (m && new Date(`${m[3]}-${m[2]}-${m[1]}T23:59:59Z`) < now) return { outcome: "gone", detail: { reason: "expired_at_source" } };
  // Still listed by Reed. That is not proof the employer is still accepting applications.
  return { outcome: "listed" };
}

/** USAJOBS search?ControlNumber=… . The search only returns open announcements,
 * but an empty answer is treated like a 404 (needs two, 12 hours apart). */
export function usajobsOutcome(status: number | null, body: { SearchResult?: { SearchResultCount?: number;
  SearchResultItems?: { MatchedObjectDescriptor?: { ApplicationCloseDate?: string } }[] } } | null, now = new Date()):
  { outcome: Outcome; detail?: Record<string, unknown> } {
  const c = classifyHttp(status);
  if (c) return { outcome: c };
  const items = body?.SearchResult?.SearchResultItems;
  if (!Array.isArray(items)) return { outcome: "transient", detail: { reason: "unexpected_body" } };
  if (items.length === 0) return { outcome: "not_found" };
  const close = Date.parse(items[0].MatchedObjectDescriptor?.ApplicationCloseDate ?? "");
  if (!Number.isNaN(close) && close < now.getTime()) return { outcome: "gone", detail: { reason: "closed" } };
  // Listed as open by USAJOBS. Announcements can still close early (e.g. when an
  // application cap is reached), so this is "listed", not "confirmed open".
  // "confirmed_open" is reserved for an employer's own confirmation.
  return { outcome: "listed" };
}
