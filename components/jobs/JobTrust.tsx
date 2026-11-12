"use client";

import { useId, useState } from "react";
import {
  closingLabel, lastCheckedDate, shortDate, sourceLabel, verification, type TrustFields,
} from "@/lib/job-trust";

// Where a listing came from, how fresh it is, who can apply, and a way to
// report it. Wording rules live in lib/job-trust.ts.

// Adzuna's terms: each displayed advert is labelled "Adzuna" (at least
// 116 × 23 px), hyperlinked to adzuna.co.uk or the local Adzuna site.
const ADZUNA_SITE: Record<string, string> = {
  GB: "https://www.adzuna.co.uk", US: "https://www.adzuna.com", CA: "https://www.adzuna.ca",
  AU: "https://www.adzuna.com.au", ZA: "https://www.adzuna.co.za", SG: "https://www.adzuna.sg",
  IN: "https://www.adzuna.in", DE: "https://www.adzuna.de", FR: "https://www.adzuna.fr", NL: "https://www.adzuna.nl",
};

export function AdzunaAttribution({ country }: { country: string }) {
  return (
    <a className="jt-adzuna" href={ADZUNA_SITE[country] ?? "https://www.adzuna.co.uk"} target="_blank" rel="noopener noreferrer">
      Jobs by <strong>Adzuna</strong>
    </a>
  );
}

type TrustJob = TrustFields & { id: string; country: string; company_name: string | null; source_url?: string | null };

// US federal (USAJOBS) jobs almost always carry citizenship or other
// eligibility conditions, even when "open to the public".
const hasConditions = (j: TrustJob) => !!j.is_restricted || j.source === "usajobs";

/** Compact line under the job title in the list. */
export function JobTrustLine({ job }: { job: TrustJob }) {
  const closes = closingLabel(job);
  return (
    <div className="jt-line">
      {job.source === "adzuna" ? <AdzunaAttribution country={job.country} /> : <span>via {sourceLabel(job)}</span>}
      {closes && <span>Closes {closes}</span>}
      {hasConditions(job) && (
        <span className="jt-badge jt-badge--restricted">
          <i className="far fa-user-lock" aria-hidden="true"></i>{" "}
          {job.is_restricted ? "Eligibility restrictions" : "Eligibility conditions apply"}
        </span>
      )}
    </div>
  );
}

/** Full details block inside the job dialog. */
export function JobTrustDetails({ job, place }: { job: TrustJob; place: string }) {
  const v = verification(job);
  const checked = lastCheckedDate(job);
  const closes = closingLabel(job);
  return (
    <div className="jt-details">
      <dl className="jt-dl">
        <div><dt>Employer</dt><dd>{job.company_name ?? "Not named in the listing"}</dd></div>
        <div><dt>Location</dt><dd>{place}</dd></div>
        <div>
          <dt>Source</dt>
          <dd>
            {job.source === "adzuna" ? (
              <AdzunaAttribution country={job.country} />
            ) : job.source_url ? (
              <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                {sourceLabel(job)} <span className="visually-hidden">(official listing, opens in a new tab)</span>
              </a>
            ) : (
              sourceLabel(job)
            )}
          </dd>
        </div>
        <div><dt>Posted</dt><dd>{shortDate(job.posted_at) ?? "Not stated"}</dd></div>
        <div><dt>Closing date</dt><dd>{closes ?? "Not provided by the source"}</dd></div>
        <div>
          <dt>Last checked</dt>
          <dd>
            {checked.date
              ? checked.how === "feed" ? `${checked.date} (in the source's listings)` : checked.date
              : "Not yet checked"}
          </dd>
        </div>
      </dl>
      <p className={`jt-status jt-status--${v.tone}`}>
        <strong>{v.label}.</strong> {v.explain}
      </p>
      {(hasConditions(job) || job.eligibility) && (
        <div className="jt-eligibility" role="note">
          <strong>Who can apply</strong>
          <p>{job.eligibility ?? (job.is_restricted ? "The source says this job is not open to everyone." : "Not stated in the listing.")}</p>
          {job.source === "usajobs" && (
            <p>
              This is a US federal government job. Most federal jobs require US citizenship, and some are open only to
              current federal employees, veterans or military families.
            </p>
          )}
          <p className="jt-small">Taken from {sourceLabel(job)}. Check the full requirements in the official listing before applying.</p>
        </div>
      )}
      {job.source === "teaching_vacancies" && (
        <p className="jt-small">
          Contains public sector information licensed under the{" "}
          <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener noreferrer">
            Open Government Licence v3.0
          </a>.
        </p>
      )}
    </div>
  );
}

const REASONS: { value: string; label: string }[] = [
  { value: "link_broken", label: "The job link doesn't work" },
  { value: "job_closed", label: "The job is closed or filled" },
  { value: "wrong_details", label: "Details are wrong (place, salary, employer)" },
  { value: "not_a_teaching_job", label: "It isn't an education job" },
  { value: "other", label: "Something else" },
];

export function ReportJob({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const id = useId().replace(/:/g, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setMessage("Choose a reason.");
      return;
    }
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/jobs/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, reason, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "We couldn't send your report. Please try again.");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
      setMessage("We couldn't send your report. Check your connection and try again.");
    }
  }

  if (state === "sent") {
    return (
      <p className="jt-report-done" role="status">
        <i className="far fa-check" aria-hidden="true"></i> Report sent. We'll check this job again with its source.
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" className="jt-report-toggle" onClick={() => setOpen(true)}>
        <i className="far fa-flag" aria-hidden="true"></i> Report an unavailable job
      </button>
    );
  }
  return (
    <form className="jt-report" onSubmit={submit} aria-labelledby={`${id}-h`}>
      <p id={`${id}-h`} className="jt-report__title">What's wrong with this listing?</p>
      <fieldset>
        <legend className="visually-hidden">Reason</legend>
        {REASONS.map((r) => (
          <label key={r.value} className="jt-radio">
            <input type="radio" name={`${id}-reason`} value={r.value} checked={reason === r.value}
              onChange={() => setReason(r.value)} />
            {r.label}
          </label>
        ))}
      </fieldset>
      <label htmlFor={`${id}-note`} className="jt-small">Anything else? (optional — please don't include personal details)</label>
      <textarea id={`${id}-note`} maxLength={500} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      {message && <p className="jt-error" role="alert">{message}</p>}
      <div className="jt-report__actions">
        <button type="submit" className="th-btn btn-sm" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send report"}
        </button>
        <button type="button" className="jt-link" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
