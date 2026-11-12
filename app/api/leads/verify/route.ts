import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase";
import { createLead, recordPortalVisitor } from "@/lib/leads";
import { ACCESS_COOKIE, accessCookieOptions, otpMatches } from "@/lib/portal-access";
import { createSession } from "@/lib/portal-session";

const GENERIC_ERROR = "Invalid or expired code";
// Across all of an email's codes: after 10 wrong guesses in 24 hours, no code
// for that email is accepted until the window passes (stops someone rotating
// through new codes to keep guessing).
const MAX_FAILED_PER_EMAIL_PER_DAY = 10;


export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, job_id, code } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const jobId: string | null = job_id ?? null;

  let otpQuery = supabaseServiceRole
    .from("email_otps")
    .select("*")
    .eq("email", normalizedEmail)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  otpQuery = jobId ? otpQuery.eq("job_id", jobId) : otpQuery.is("job_id", null);

  const { data: otp, error: fetchError } = await otpQuery.maybeSingle();

  if (fetchError || !otp) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const { data: recentCodes } = await supabaseServiceRole
    .from("email_otps")
    .select("attempts")
    .eq("email", normalizedEmail)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  const failedToday = (recentCodes ?? []).reduce((n: number, r: { attempts?: number }) => n + (r.attempts ?? 0), 0);
  if (failedToday >= MAX_FAILED_PER_EMAIL_PER_DAY) {
    return NextResponse.json({ error: "Too many attempts. Please try again tomorrow." }, { status: 429 });
  }

  if (otp.attempts >= otp.max_attempts) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  if (!otpMatches(code, otp.code_hash)) {
    await supabaseServiceRole
      .from("email_otps")
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);

    const attemptsLeft = otp.max_attempts - (otp.attempts + 1);
    return NextResponse.json(
      { error: GENERIC_ERROR, attempts_left: Math.max(attemptsLeft, 0) },
      { status: 400 }
    );
  }

  // Single use, even when two requests race: only the request that actually
  // flips consumed_at from null may continue.
  const { data: consumed, error: consumeError } = await supabaseServiceRole
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otp.id)
    .is("consumed_at", null)
    .select("id");

  if (consumeError || !consumed || consumed.length !== 1) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const sourceIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    if (!otp.job_id) {
      // One-time verification for the whole portal: one visitor record per
      // email (updated on a new device), one session per browser.
      const leadId = await recordPortalVisitor({
        name: otp.name, email: normalizedEmail, marketingOptIn: otp.marketing_opt_in === true, sourceIp,
      });
      const access = await createSession(leadId);
      const res = NextResponse.json({ ok: true, access: !!access, access_expires_at: access?.expires.toISOString() ?? null });
      if (access) res.cookies.set(ACCESS_COOKIE, access.token, accessCookieOptions(access.expires));
      else console.error("[verify] session not created (PORTAL_ACCESS_SECRET or portal_sessions missing)");
      return res;
    }
    // Legacy per-job flow (kept for compatibility).
    const result = await createLead({ name: otp.name, email: normalizedEmail, jobId: otp.job_id, sourceIp });
    return NextResponse.json({ apply_url: result.apply_url });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
