// Staging safety net for outgoing email.
//
// On a Vercel Preview deployment (VERCEL_ENV=preview), email may only go to the
// addresses listed in EMAIL_TEST_ALLOWLIST (comma-separated). If that variable
// is missing on a preview, NO email is sent at all (fails closed). This stops a
// staging site from ever emailing a real visitor, whatever key it is given.
//
// Production (VERCEL_ENV=production) is not affected unless EMAIL_TEST_ALLOWLIST
// is set there, which it never should be.

export function emailAllowed(to: string, env: Record<string, string | undefined> = process.env): boolean {
  const list = (env.EMAIL_TEST_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length > 0) return list.includes(to.trim().toLowerCase());
  return env.VERCEL_ENV !== "preview";
}
