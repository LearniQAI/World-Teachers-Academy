import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServiceRole } from "@/lib/supabase";
import { createLead } from "@/lib/leads";
import { ACCESS_COOKIE, accessCookieOptions, signAccessToken } from "@/lib/portal-access";

const GENERIC_ERROR = "Invalid or expired code";

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

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

  if (otp.attempts >= otp.max_attempts) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  if (hashCode(code) !== otp.code_hash) {
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

  const { error: consumeError } = await supabaseServiceRole
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otp.id)
    .is("consumed_at", null);

  if (consumeError) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const sourceIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    const result = await createLead({
      name: otp.name,
      email: normalizedEmail,
      jobId: otp.job_id,
      sourceIp,
    });
    // One verification unlocks the whole Job Portal on this browser.
    const access = signAccessToken(result.id);
    const res = NextResponse.json({ ...result, access: !!access, access_expires_at: access?.expires.toISOString() ?? null });
    if (access) res.cookies.set(ACCESS_COOKIE, access.token, accessCookieOptions(access.expires));
    else console.error("[verify] PORTAL_ACCESS_SECRET missing or too short; portal access not granted");
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
