import crypto from "crypto";

/**
 * Checks `Authorization: Bearer <secret>` against an environment variable in
 * constant time. Returns "unconfigured" when the variable is not set, so the
 * caller can refuse every request (fail closed).
 */
export function checkBearer(
  header: string | null,
  secret: string | undefined
): "ok" | "unauthorized" | "unconfigured" {
  if (!secret) return "unconfigured";
  const given = Buffer.from(header ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected) ? "ok" : "unauthorized";
}
