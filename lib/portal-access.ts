import crypto from "crypto";

// One-time verification for the Job Portal.
//
// After a visitor verifies their email once (app/api/leads/verify), the server
// sets an httpOnly cookie holding a signed token. While it is valid, every
// vacancy and Apply link is open to them — no further forms or codes.
//
//   token   = base64url(JSON payload) + "." + base64url(HMAC-SHA256(secret, payload))
//   payload = { v: 1, sid: <portal_sessions.id>, lid: <leads.id>, iat, exp }
//
// The signature proves the cookie was issued by WTA; the session row
// (lib/portal-session.ts) decides whether it is still valid, so sign-out and
// revocation take effect immediately, even for a copied cookie.
//
// - No name or email is in the cookie; only the lead's id.
// - The cookie is httpOnly (no page script can read it), Secure in
//   production, SameSite=Lax, and lasts PORTAL_ACCESS_DAYS (default 90).
// - It survives refreshes and browser restarts on the same browser. A new
//   device or browser verifies once more (a fresh code to the same email).
// - Revoking: one session (sign-out) or every session of a visitor via the
//   portal_sessions table; everyone at once with PORTAL_ACCESS_NOT_BEFORE
//   (ISO date) or by rotating PORTAL_ACCESS_SECRET.
// - If PORTAL_ACCESS_SECRET is missing or shorter than 32 characters, no
//   access token is ever issued or accepted (fails closed).

export const ACCESS_COOKIE = "wta_portal_access";

export type Payload = { v: 1; sid: string; lid: string; iat: number; exp: number };

function secret(): Buffer | null {
  const s = process.env.PORTAL_ACCESS_SECRET ?? "";
  return s.length >= 32 ? Buffer.from(s, "utf8") : null;
}

export function accessDays(): number {
  const n = Number(process.env.PORTAL_ACCESS_DAYS ?? "90");
  return Number.isFinite(n) && n >= 1 && n <= 365 ? Math.floor(n) : 90;
}

const b64url = (b: Buffer) => b.toString("base64url");

export function signAccessToken(leadId: string, sessionId: string, now = new Date(), expiresAt?: Date): { token: string; expires: Date } | null {
  const key = secret();
  if (!key) return null;
  const iat = Math.floor(now.getTime() / 1000);
  const exp = expiresAt ? Math.floor(expiresAt.getTime() / 1000) : iat + accessDays() * 86_400;
  const body = b64url(Buffer.from(JSON.stringify({ v: 1, sid: sessionId, lid: leadId, iat, exp } satisfies Payload)));
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
  if (p?.v !== 1 || typeof p.sid !== "string" || typeof p.lid !== "string" || typeof p.iat !== "number" || typeof p.exp !== "number") return null;
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

/** Verification codes are stored as HMAC-SHA256 with a server secret, so a
 * copy of the database alone cannot be used to recover a code. Codes stored
 * before this change (plain SHA-256) are still accepted while they last
 * (10 minutes). */
export function hashOtp(code: string): string {
  const pepper = process.env.OTP_PEPPER || process.env.PORTAL_ACCESS_SECRET || "";
  return pepper ? crypto.createHmac("sha256", pepper).update(code).digest("hex") : legacyHashOtp(code);
}
export function legacyHashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
export function otpMatches(code: string, stored: string): boolean {
  const a = Buffer.from(stored, "hex");
  for (const h of [hashOtp(code), legacyHashOtp(code)]) {
    const b = Buffer.from(h, "hex");
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}
