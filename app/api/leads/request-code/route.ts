import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServiceRole } from "@/lib/supabase";
import { sendOtpEmail } from "@/lib/resend";
import { getApplyUrl } from "@/lib/leads";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_RATE_LIMIT = 3;
const IP_RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RECENT_VERIFICATION_WINDOW_MS = 24 * 60 * 60 * 1000;

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, job_id, consent_given } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (consent_given !== true) {
    return NextResponse.json(
      { error: "You must consent to be contacted before applying" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const jobId: string | null = job_id ?? null;
  const sourceIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  // Already verified this exact email for this job recently — skip straight
  // to the apply URL rather than sending another code.
  if (jobId) {
    const recentSince = new Date(Date.now() - RECENT_VERIFICATION_WINDOW_MS).toISOString();
    const { data: priorLead } = await supabaseServiceRole
      .from("leads")
      .select("id, job_id")
      .eq("email", normalizedEmail)
      .eq("job_id", jobId)
      .gte("applied_at", recentSince)
      .order("applied_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (priorLead) {
      const applyUrl = await getApplyUrl(priorLead.job_id);
      return NextResponse.json({ ok: true, skip_verification: true, id: priorLead.id, apply_url: applyUrl });
    }
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count: emailCount } = await supabaseServiceRole
    .from("email_otps")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizedEmail)
    .gte("created_at", windowStart);

  if ((emailCount ?? 0) >= EMAIL_RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many code requests for this email. Please try again later." },
      { status: 429 }
    );
  }

  if (sourceIp) {
    const { count: ipCount } = await supabaseServiceRole
      .from("email_otps")
      .select("id", { count: "exact", head: true })
      .eq("ip", sourceIp)
      .gte("created_at", windowStart);

    if ((ipCount ?? 0) >= IP_RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many code requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  const code = generateCode();
  const codeHash = hashCode(code);

  const { error: insertError } = await supabaseServiceRole.from("email_otps").insert({
    email: normalizedEmail,
    job_id: jobId,
    name: name.trim(),
    code_hash: codeHash,
    ip: sourceIp,
  });

  if (insertError) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    await sendOtpEmail(normalizedEmail, code);
  } catch {
    return NextResponse.json(
      { error: "Could not send the verification email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
