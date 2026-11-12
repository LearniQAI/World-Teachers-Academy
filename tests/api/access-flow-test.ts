// Verify-once scenarios from the owner's test list, against the real route code
// with a fake database. Run via tests/README.md.
import { POST as requestCode } from "@/app/api/leads/request-code/route";
import { POST as verify } from "@/app/api/leads/verify/route";
import { GET as session, DELETE as signOut } from "@/app/api/portal/session/route";
import { GET as jobs } from "@/app/api/jobs/route";
import { signAccessToken } from "@/lib/portal-access";
import { tables } from "./fake-db";
import { sent } from "./resend-stub";
process.env.PORTAL_ACCESS_SECRET = "route-test-secret-long-enough-0123456789";
const results: [string, boolean][] = []; const t = (n: string, ok: boolean) => results.push([n, ok]);
type Res = { status: number; json: () => Promise<Record<string, unknown>>; cookieJar: { name: string; value: string; opts?: Record<string, unknown> }[] };
let ipN = 0;
const req = (body: unknown, cookie?: string, url = "http://x/api/jobs?page=1", ip?: string) => ({
  json: async () => body, headers: new Headers({ "x-forwarded-for": ip ?? "198.51.100." + (++ipN % 250) }),
  cookies: { get: (n: string) => (cookie && n === "wta_portal_access" ? { value: cookie } : undefined) },
  nextUrl: new URL(url),
}) as never;
const call = async <T,>(p: Promise<T>) => (await p) as unknown as Res;
async function listAll(cookie?: string, pages = 12) {
  const out: { id: string; apply_url: string | null; locked: boolean }[] = []; let verified = false;
  for (let p = 1; p <= pages; p++) { const b = await (await call(jobs(req(null, cookie, `http://x/api/jobs?page=${p}`)))).json(); verified = b.verified as boolean; out.push(...(b.jobs as never[])); }
  return { out, verified };
}
async function verifyOnce(email: string, marketing: boolean, ip?: string) {
  const before = sent.length;
  await call(requestCode(req({ name: "Visitor", email, marketing_opt_in: marketing }, undefined, undefined, ip)));
  const code = sent[sent.length - 1]?.code; if (sent.length === before) return { r: null as Res | null, cookie: undefined };
  const r = await call(verify(req({ email, code }, undefined, undefined, ip)));
  return { r, cookie: r.cookieJar.find((c) => c.name === "wta_portal_access")?.value, code };
}
(async () => {
  for (let i = 0; i < 120; i++) tables.jobs.push({ id: "job" + i, title: "Teacher " + i, country: ["GB", "JP", "KR", "AE"][i % 4], is_active: true,
    source: i < 110 ? "reed" : "adzuna", apply_url: (i < 110 ? "https://www.reed.co.uk/jobs/" : "https://www.adzuna.co.uk/jobs/land/ad/") + i, posted_at: new Date(Date.now() - i * 1000).toISOString() });

  // Unauthorised visitor
  let all = await listAll();
  t("unauthorised: no Reed apply link is sent", all.out.filter((j) => j.id < "job110" || +j.id.slice(3) < 110).every((j) => +j.id.slice(3) >= 110 || (j.apply_url === null && j.locked)));
  t("unauthorised: the listing never reads apply_url with the public key", ((globalThis as { __anonApplyUrlAttempt?: number }).__anonApplyUrlAttempt ?? 0) === 0);
  const forged = signAccessToken("lead-x", "session-that-does-not-exist")!.token;
  t("forged-but-signed cookie for a non-existent session is refused", (await listAll(forged, 1)).verified === false);
  t("cookie with a bad signature is refused", (await listAll(forged.slice(0, -3) + "abc", 1)).verified === false);

  // 1. Verify once, open 100 different vacancies
  const v1 = await verifyOnce("Jane@Example.com", false);
  const b1 = await v1.r!.json();
  const ck = v1.r!.cookieJar.find((c) => c.name === "wta_portal_access")!;
  t("declined marketing, still verified and given access", b1.access === true && !!v1.cookie);
  t("visitor record has marketing_opt_in = false", tables.leads.length === 1 && tables.leads[0].marketing_opt_in === false && tables.leads[0].purpose === "portal_access");
  all = await listAll(v1.cookie);
  const opened = all.out.filter((j) => +j.id.slice(3) < 110 && j.apply_url);
  t("one verification opens 110 different vacancies across 12 pages (100+ required)", opened.length === 110 && sent.length === 1);
  t("apply links are the original provider URLs, unchanged", opened.every((j) => j.apply_url === "https://www.reed.co.uk/jobs/" + j.id.slice(3)));
  // 2–3. Refresh and browser restart
  t("refresh keeps access (same cookie)", (await (await call(session(req(null, v1.cookie)))).json()).verified === true);
  t("cookie is persistent (Expires set ~90 days ahead), so a browser restart keeps it",
    ck.opts?.httpOnly === true && ck.opts?.sameSite === "lax" && Math.abs((ck.opts?.expires as Date).getTime() - Date.now() - 90 * 86_400_000) < 120_000);
  // 4. Second device: new verification, same visitor record, both sessions valid
  t("second device without the cookie is not verified", (await listAll(undefined, 1)).verified === false);
  const v2 = await verifyOnce("jane@example.com", true);
  t("second device verifies with a fresh code", !!v2.cookie && v2.cookie !== v1.cookie && sent.length === 2);
  t("still one visitor record; ticking marketing on device 2 records the opt-in", tables.leads.length === 1 && tables.leads[0].marketing_opt_in === true);
  t("both devices have access", (await listAll(v1.cookie, 1)).verified && (await listAll(v2.cookie, 1)).verified);
  // 5. Code expiry and reuse
  t("a used code cannot be used again", (await call(verify(req({ email: "jane@example.com", code: v2.code })))).status === 400);
  await call(requestCode(req({ name: "Visitor", email: "late@example.com", marketing_opt_in: false })));
  const lateCode = sent[sent.length - 1].code; tables.email_otps.filter((o) => o.email === "late@example.com").forEach((o) => (o.expires_at = new Date(Date.now() - 1000).toISOString()));
  t("an expired code is refused", (await call(verify(req({ email: "late@example.com", code: lateCode })))).status === 400);
  await call(requestCode(req({ name: "Visitor", email: "race@example.com" })));
  const raceCode = sent[sent.length - 1].code;
  const [ra, rb] = await Promise.all([call(verify(req({ email: "race@example.com", code: raceCode }))), call(verify(req({ email: "race@example.com", code: raceCode })))]);
  t("two simultaneous uses of one code: only one succeeds", [ra.status, rb.status].sort().join() === "200,400");
  // Brute force
  await call(requestCode(req({ name: "Visitor", email: "target@example.com" })));
  const right = sent[sent.length - 1].code; let wrongs = 0;
  for (let i = 0; i < 5; i++) { const w = String((Number(right) + 1 + i) % 1_000_000).padStart(6, "0"); if ((await call(verify(req({ email: "target@example.com", code: w })))).status === 400) wrongs++; }
  t("after 5 wrong guesses even the right code is refused", wrongs === 5 && (await call(verify(req({ email: "target@example.com", code: right })))).status === 400);
  let lastStatus = 0; for (let i = 0; i < 3; i++) lastStatus = (await call(requestCode(req({ name: "V", email: "target@example.com" })))).status;
  t("4th code for the same email within an hour is refused (429)", lastStatus === 429);
  let ipStatus = 0; for (let i = 0; i < 11; i++) ipStatus = (await call(requestCode(req({ name: "V", email: `ip${i}@example.com` }, undefined, undefined, "203.0.113.77")))).status;
  t("11th code request from one connection within an hour is refused (429)", ipStatus === 429);
  // Rate limits across codes, not just per code
  const slow = "rotate@example.com"; let wrongTotal = 0; let locked429 = false;
  for (let round = 0; round < 3; round++) {
    tables.email_otps.filter((o) => o.email === slow).forEach((o) => (o.created_at = new Date(Date.now() - 2 * 3600_000).toISOString()));
    const rc = await call(requestCode(req({ name: "V", email: slow })));
    if (rc.status !== 200) break;
    const good = sent[sent.length - 1].code;
    for (let i = 0; i < 5; i++) {
      const w = String((Number(good) + 7 + i) % 1_000_000).padStart(6, "0");
      const st = (await call(verify(req({ email: slow, code: w })))).status;
      if (st === 429) { locked429 = true; break; }
      wrongTotal++;
    }
    if (locked429) break;
  }
  const lastGood = sent[sent.length - 1].code;
  t("across new codes, an email is locked after 10 wrong guesses in a day (429), even with the right code",
    wrongTotal === 10 && (await call(verify(req({ email: slow, code: lastGood })))).status === 429);
  tables.email_otps.filter((o) => o.email === "daily@example.com");
  let dayStatus = 0;
  for (let i = 0; i < 7; i++) {
    tables.email_otps.filter((o) => o.email === "daily@example.com").forEach((o) => (o.created_at = new Date(Date.now() - 2 * 3600_000).toISOString()));
    dayStatus = (await call(requestCode(req({ name: "V", email: "daily@example.com" })))).status;
  }
  t("a 7th code for the same email within 24 hours is refused, even spread over hours (429)", dayStatus === 429);
  // 6. Sign out, replay, sign out everywhere
  await call(signOut(req(null, v1.cookie, "http://x/api/portal/session")));
  t("after signing out, the old cookie no longer works even if copied (session theft)", (await listAll(v1.cookie, 1)).verified === false);
  t("signing out one device leaves the other signed in", (await listAll(v2.cookie, 1)).verified === true);
  const v3 = await verifyOnce("jane@example.com", false, "198.51.100.200");
  await call(signOut(req(null, v3.cookie, "http://x/api/portal/session?everywhere=1")));
  t("sign out on all devices ends every session", !(await listAll(v2.cookie, 1)).verified && !(await listAll(v3.cookie, 1)).verified);
  t("declining marketing on a later verification never switches an opt-in off silently, and never on", tables.leads[0].marketing_opt_in === true);
  // 10. 90-day expiry
  const v4 = await verifyOnce("expiry@example.com", false, "198.51.100.201");
  tables.portal_sessions.filter((s) => !s.revoked_at).forEach((s) => (s.expires_at = new Date(Date.now() - 1000).toISOString()));
  t("when the 90 days are over, access ends", (await listAll(v4.cookie, 1)).verified === false);
  // Personal data exposure
  const bodies = JSON.stringify([b1, await (await call(session(req(null, v2.cookie)))).json(), await (await call(jobs(req(null, v2.cookie)))).json()]);
  t("no API response contains a visitor's name, email or record id", !/example\.com|Visitor|"lead/.test(bodies) && !/"id":"[0-9a-f-]{36}"/.test(JSON.stringify(b1)));
  t("the cookie holds no name or email", !/example|Visitor/i.test(Buffer.from(v1.cookie!.split(".")[0], "base64url").toString()));
  const wrongEmail = await (await call(verify(req({ email: "nobody@example.com", code: "123456" })))).json();
  const wrongCode = await (await call(verify(req({ email: "target@example.com", code: "123456" })))).json();
  t("same error for an unknown email and a wrong code (no account probing)", wrongEmail.error === wrongCode.error);
  t("verification codes are stored as keyed hashes, never in plain text", tables.email_otps.every((o) => typeof o.code_hash === "string" && !sent.some((s) => o.code_hash === s.code)));
  for (const [n, ok] of results) console.log(ok ? "PASS" : "FAIL", n);
  console.log(results.filter((x) => x[1]).length, "passed,", results.filter((x) => !x[1]).length, "failed");
})();
