import { POST as requestCode } from "@/app/api/leads/request-code/route";
import { POST as verify } from "@/app/api/leads/verify/route";
import { GET as session, DELETE as signOut } from "@/app/api/portal/session/route";
import { GET as jobs } from "@/app/api/jobs/route";
import { tables } from "./fake-db";
import { sent } from "./resend-stub";
process.env.PORTAL_ACCESS_SECRET = "route-test-secret-long-enough-0123456789";
const results: [string, boolean][] = []; const t = (n: string, ok: boolean) => results.push([n, ok]);
type Res = { status: number; json: () => Promise<Record<string, unknown>>; cookieJar: { name: string; value: string; opts?: Record<string, unknown> }[] };
const req = (body: unknown, cookie?: string, url = "http://x/api/jobs?page=1") => ({
  json: async () => body, headers: new Headers({ "x-forwarded-for": "198.51.100.9" }),
  cookies: { get: (n: string) => (cookie && n === "wta_portal_access" ? { value: cookie } : undefined) },
  nextUrl: new URL(url),
}) as never;
(async () => {
  for (let i = 0; i < 30; i++) tables.jobs.push({ id: "job" + i, title: "Teacher " + i, country: i % 2 ? "GB" : "ZA", is_active: true,
    source: i % 3 === 0 ? "adzuna" : "reed", apply_url: "https://jobs.example/" + i, posted_at: new Date().toISOString() });

  // Not verified: Reed links withheld, Adzuna open
  let r = (await jobs(req(null))) as unknown as Res; let b = await r.json();
  const list = b.jobs as { source: string; apply_url: string | null; locked: boolean }[];
  t("unverified: Reed apply links withheld", list.filter((j) => j.source === "reed").every((j) => j.apply_url === null && j.locked));
  t("unverified: Adzuna jobs open with their link (attribution handled in the page)", list.filter((j) => j.source === "adzuna").every((j) => !!j.apply_url && !j.locked));
  t("unverified: verified=false", b.verified === false);

  // Verify once
  r = (await requestCode(req({ name: "Jane Test", email: "Jane@Example.com", consent_given: true }))) as unknown as Res;
  t("code requested", r.status === 200 && sent.length === 1);
  r = (await verify(req({ email: "jane@example.com", code: "000000" }))) as unknown as Res;
  t("wrong code refused, no cookie", r.status === 400 && r.cookieJar.length === 0);
  r = (await verify(req({ email: "jane@example.com", code: sent[0].code }))) as unknown as Res; b = await r.json();
  const cookie = r.cookieJar.find((c) => c.name === "wta_portal_access");
  t("right code: access cookie set", r.status === 200 && b.access === true && !!cookie);
  t("cookie is httpOnly, SameSite=Lax, path /, expires in ~90 days",
    !!cookie && cookie.opts?.httpOnly === true && cookie.opts?.sameSite === "lax" && cookie.opts?.path === "/" &&
    Math.abs((cookie.opts?.expires as Date).getTime() - Date.now() - 90 * 86_400_000) < 60_000);
  t("one portal-wide lead record (no job id)", tables.leads.length === 1 && tables.leads[0].job_id == null);
  r = (await verify(req({ email: "jane@example.com", code: sent[0].code }))) as unknown as Res;
  t("the same code can't be used twice", r.status === 400);

  // Verified: every page, every job, no more codes
  let allOpen = true;
  for (let p = 1; p <= 3; p++) {
    r = (await jobs(req(null, cookie!.value, `http://x/api/jobs?page=${p}`))) as unknown as Res; b = await r.json();
    allOpen = allOpen && (b.jobs as { apply_url: string | null }[]).every((j) => !!j.apply_url) && b.verified === true;
  }
  t("verified: all 30 jobs across 3 pages open, no new code sent", allOpen && sent.length === 1);
  r = (await session(req(null, cookie!.value))) as unknown as Res; b = await r.json();
  t("session: verified with an expiry date", b.verified === true && typeof b.expires_at === "string");
  r = (await session(req(null, cookie!.value + "x"))) as unknown as Res; b = await r.json();
  t("session: tampered cookie refused", b.verified === false);
  r = (await signOut()) as unknown as Res;
  t("sign out clears the cookie", r.cookieJar.some((c) => c.name === "wta_portal_access" && c.value === "" && c.opts?.maxAge === 0));

  // Without a secret the system fails closed
  process.env.PORTAL_ACCESS_SECRET = "";
  r = (await jobs(req(null, cookie!.value))) as unknown as Res; b = await r.json();
  t("no secret configured: nothing unlocked", b.verified === false);
  for (const [n, ok] of results) console.log(ok ? "PASS" : "FAIL", n);
  console.log(results.filter((x) => x[1]).length, "passed,", results.filter((x) => !x[1]).length, "failed");
})();
