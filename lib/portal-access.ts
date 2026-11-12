import crypto from "crypto";

// One-time verification for the Job Portal.
//
// After a visitor verifies their email once (app/api/leads/verify), the server
// sets an httpOnly cookie holding a signed token. While it is valid, every
// vacancy and Apply link is open to them — no further forms or codes.
//
//   token   = base64url(JSON payload) + "." + base64url(HMAC-SHA256(secret, payload))
//   payload = { v: 1, lid: <leads.id>, iat: <issued, unix s>, exp: <expires, unix s> }
//
// - No name or email is in the cookie; only the lead's id.
// - The cookie is httpOnly (no page script can read it), Secure in
//   production, SameSite=Lax, and lasts PORTAL_ACCESS_DAYS (default 90).
// - It survives refreshes and browser restarts on the same browser. A new
//   device or browser verifies once more (a fresh code to the same email).
// - Revoking: setting PORTAL_ACCESS_NOT_BEFORE (ISO date) invalidates every
//   token issued before it; rotating PORTAL_ACCESS_SECRET does the same.
//   Per-visitor revocation needs a database column (proposed separately).
// - If PORTAL_ACCESS_SECRET is missing or shorter than 32 characters, no
//   access token is ever issued or accepted (fails closed).

export const ACCESS_COOKIE = "wta_portal_access";

type Payload = { v: 1; lid: string; iat: number; exp: number };

function secret(): Buffer | null {
  const s = process.env.PORTAL_ACCESS_SECRET ?? "";
  return s.length >= 32 ? Buffer.from(s, "utf8") : null;
}

export function accessDays(): number {
  const n = Number(process.env.PORTAL_ACCESS_DAYS ?? "90");
  return Number.isFinite(n) && n >= 1 && n <= 365 ? Math.floor(n) : 90;
}

const b64url = (b: Buffer) => b.toString("base64url");

export function signAccessToken(leadId: string, now = new Date()): { token: string; expires: Date } | null {
  const key = secret();
  if (!key) return null;
  const iat = Math.floor(now.getTime() / 1000);
  const exp = iat + accessDays() * 86_400;
  const body = b64url(Buffer.from(JSON.stringify({ v: 1, lid: leadId, iat, exp } satisfies Payload)));
  const sig = b64url(crypto.createHmac("sha256", key).update(body).digest());
  return { token: `${body}.${sig}`, expires: new Date(exp * 1000) };
}

export function readAccessToken(token: string | undefined | null, now = new Date()): Payload | null {
  const key = secret();
  if (!key || !token || token.length > 512) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = crypto.createHmac("sha256", key).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  let p: Payload;
  try {
    p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (p?.v !== 1 || typeof p.lid !== "string" || typeof p.iat !== "number" || typeof p.exp !== "number") return null;
  const t = Math.floor(now.getTime() / 1000);
  if (p.exp <= t || p.iat > t + 300) return null;
  const notBefore = Date.parse(process.env.PORTAL_ACCESS_NOT_BEFORE ?? "");
  if (!Number.isNaN(notBefore) && p.iat * 1000 < notBefore) return null;
  return p;
}

export function accessCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}
