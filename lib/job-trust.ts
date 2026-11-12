// Visitor-facing facts about where a listing came from and how fresh it is.
// Works with today's columns (source, posted_at, updated_at) and with the
// columns added by docs/proposals/2026-11-job-verification.sql once approved.
//
// Wording rules:
//   - "Last checked" = we asked the source and it still lists the job.
//   - "Confirmed open" = the source/employer stated it is accepting applications.
//     Only shown when last_confirmed_open_at is set. A successful API response
//     on its own is never presented as "confirmed open".
//   - Nothing is shown as checked when it was not.

export type TrustFields = {
  source?: string | null;
  source_name?: string | null;
  posted_at?: string | null;
  updated_at?: string | null;
  closes_at?: string | null;
  last_seen_in_feed_at?: string | null;
  last_checked_at?: string | null;
  last_confirmed_open_at?: string | null;
  status?: string | null;
  eligibility?: string | null;
  is_restricted?: boolean | null;
};

const SOURCE_LABELS: Record<string, string> = {
  adzuna: "Adzuna",
  reed: "Reed",
  teaching_vacancies: "Teaching Vacancies (Department for Education)",
  usajobs: "USAJOBS",
};

export function sourceLabel(j: TrustFields): string {
  return j.source_name || (j.source ? SOURCE_LABELS[j.source] ?? j.source : "Job feed");
}

export function shortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export type Verification = { label: string; tone: "confirmed" | "listed" | "uncertain" | "unchecked"; explain: string };

export function verification(j: TrustFields, now = new Date()): Verification {
  const recent = (iso?: string | null, days = 7) =>
    !!iso && now.getTime() - new Date(iso).getTime() < days * 86_400_000;
  if (j.status === "uncertain") {
    return { label: "Couldn't be checked recently", tone: "uncertain",
      explain: "Our recent checks with the source didn't get a clear answer. We'll keep trying. Check the closing date on the employer's page before applying." };
  }
  if (recent(j.last_confirmed_open_at, 14)) {
    return { label: `Confirmed open ${shortDate(j.last_confirmed_open_at)}`, tone: "confirmed",
      explain: "The source told us on this date that the employer is accepting applications." };
  }
  if (j.last_checked_at && recent(j.last_checked_at)) {
    return { label: `Listed by ${sourceLabel(j)} when last checked`, tone: "listed",
      explain: "The source still listed this job when we last checked. That doesn't confirm the employer is still accepting applications." };
  }
  const seen = j.last_seen_in_feed_at ?? j.updated_at;
  if (seen && recent(seen, 3)) {
    return { label: `In the ${sourceLabel(j)} feed`, tone: "listed",
      explain: "This job was in the source's latest listings. We haven't checked it individually, and it doesn't confirm the employer is still accepting applications." };
  }
  return { label: "Not checked recently", tone: "unchecked",
    explain: "We haven't been able to confirm this listing recently. Check with the employer before applying." };
}

/** The date shown as "Last checked": an individual check, else the last time the feed listed it. */
export function lastCheckedDate(j: TrustFields): { date: string | null; how: "check" | "feed" | null } {
  if (j.last_checked_at) return { date: shortDate(j.last_checked_at), how: "check" };
  const seen = j.last_seen_in_feed_at ?? j.updated_at;
  return seen ? { date: shortDate(seen), how: "feed" } : { date: null, how: null };
}

export function closingLabel(j: TrustFields): string | null {
  return j.closes_at ? shortDate(j.closes_at) : null;
}
