import { POST } from "@/app/api/jobs/report/route";
import { calls, setMode } from "./report-supabase-stub";
const ID = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";
let n = 0;
const req = (body: unknown, ip = "203.0.113." + (++n)) => ({
  json: async () => { if (typeof body === "string") throw new Error("bad json"); return body; },
  headers: new Headers({ "x-forwarded-for": ip }),
}) as never;
const results: [string, boolean][] = [];
const t = (name: string, ok: boolean) => results.push([name, ok]);
(async () => {
  let r = await POST(req("not json")); t("malformed JSON → 400", r.status === 400);
  r = await POST(req({ job_id: "1 OR 1=1", reason: "other" })); t("non-UUID job id → 400, database not called", r.status === 400 && calls.length === 0);
  r = await POST(req({ job_id: ID, reason: "drop table jobs" })); t("unknown reason → 400", r.status === 400 && calls.length === 0);
  r = await POST(req({ job_id: ID, reason: "other", note: { $gt: "" } })); t("non-string note ignored (stored as null)", r.status === 200 && calls.at(-1)!.args.p_note === null);
  r = await POST(req({ job_id: ID, reason: "other", note: "'); delete from jobs; -- <script>alert(1)</script> me@x.com +27 82 555 1234" + "x".repeat(2000) }));
  const note = String(calls.at(-1)!.args.p_note);
  t("note: e-mail and phone removed, capped at 500, passed as a parameter (not SQL)", note.length <= 500 && !/@/.test(note) && !/555 1234/.test(note) && calls.at(-1)!.fn === "report_job");
  t("only report_job is ever called (no table writes)", calls.every((c) => c.fn === "report_job"));
  t("no IP or personal field sent to the database", calls.every((c) => Object.keys(c.args).sort().join() === "p_job_id,p_note,p_reason"));
  // flood control: same connection, 10 per hour
  let last = 0; for (let i = 0; i < 11; i++) last = (await POST(req({ job_id: ID, reason: "other" }, "198.51.100.7"))).status;
  t("11th report from one connection in an hour → 429", last === 429);
  setMode("missing"); r = await POST(req({ job_id: ID, reason: "other" })); t("before the SQL is applied → 503 'isn't available yet'", r.status === 503);
  setMode("error"); r = await POST(req({ job_id: ID, reason: "other" })); const b = await r.json();
  t("database error → 500 without internal details", r.status === 500 && !/connection/.test(JSON.stringify(b)));
  setMode("hidden"); r = await POST(req({ job_id: ID, reason: "other" })); t("job already hidden → no error, nothing revealed", r.status === 200);
  for (const [name, ok] of results) console.log(ok ? "PASS" : "FAIL", name);
  console.log(results.filter((x) => x[1]).length, "passed,", results.filter((x) => !x[1]).length, "failed");
})();
