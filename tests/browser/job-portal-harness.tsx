import { createRoot } from "react-dom/client";
import JobPortal from "@/app/job-portal/page";
import { isRelevantTeachingJob } from "@/lib/job-relevance";
import sample from "./sample.json";
// Mock of the two API routes, using the same relevance rule as lib/jobs-query.ts.
const rows = (sample as (string | number | null)[][]).map((r) => ({ id: r[0], title: r[1], company_name: r[2], country: r[3], city: r[4], employment_type: r[5], salary_min: r[6], salary_max: r[7], currency: r[8], source: r[9], posted_at: r[10], description: r[11], apply_url: "#", is_active: true }));
// Trust fields as they will look after the verification SQL: a mix of sources and states.
const day = 86_400_000, now = Date.now();
rows.forEach((r: Record<string, unknown>, i) => {
  r.updated_at = new Date(now - 3 * 3600_000).toISOString();
  if (r.country === "GB" && i % 3 === 0) Object.assign(r, { source: "teaching_vacancies", closes_at: new Date(now + 9 * day).toISOString() });
  if (r.country === "GB" && i % 3 === 1) Object.assign(r, { source: "reed", closes_at: new Date(now + 20 * day).toISOString(), last_checked_at: new Date(now - 5 * 3600_000).toISOString() });
  if (r.country === "US") Object.assign(r, { source: "usajobs", is_restricted: true, eligibility: "Current federal employees, veterans and military spouses", closes_at: new Date(now + 14 * day).toISOString(), last_checked_at: new Date(now - 2 * 3600_000).toISOString(), last_confirmed_open_at: null });
  if (i === 4) Object.assign(r, { status: "uncertain" });
});
export const reports: unknown[] = [];
const relevant = rows.filter((r) => isRelevantTeachingJob(r.title as string));
const realFetch = window.fetch;
window.fetch = (async function (input: RequestInfo | URL) {
  const url = new URL(String(input), location.href);
  await new Promise((r) => setTimeout(r, 120));
  if (url.pathname === "/api/jobs/report") {
    const body = JSON.parse(String((arguments[1] as RequestInit | undefined)?.body ?? "{}"));
    reports.push(body); (window as unknown as { __reports: unknown[] }).__reports = reports;
    return new Response(JSON.stringify({ status: "recorded" }));
  }
  if (url.pathname === "/api/jobs/countries") {
    const counts: Record<string, number> = {};
    relevant.forEach((r) => (counts[r.country as string] = (counts[r.country as string] ?? 0) + 1));
    return new Response(JSON.stringify({ countries: Object.keys(counts).sort(), counts, total: relevant.length }));
  }
  if (url.pathname === "/api/jobs") {
    const c = url.searchParams.get("country"), k = url.searchParams.get("keyword")?.toLowerCase(), t = url.searchParams.get("employment_type");
    const page = +(url.searchParams.get("page") ?? 1);
    let list = relevant.filter((r) => (!c || r.country === c) && (!t || r.employment_type === t) && (!k || String(r.title).toLowerCase().includes(k)));
    const total = list.length; list = list.slice((page - 1) * 10, page * 10);
    return new Response(JSON.stringify({ jobs: list, total, page, page_size: 10, total_pages: Math.max(1, Math.ceil(total / 10)) }));
  }
  return realFetch(input);
}) as typeof fetch;
createRoot(document.getElementById("root")!).render(<JobPortal />);
