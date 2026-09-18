import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const sourceIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const { data: lead, error: insertError } = await supabaseServiceRole
    .from("leads")
    .insert({
      name: name.trim(),
      email: email.trim(),
      job_id: job_id ?? null,
      consent_given: true,
      source_ip: sourceIp,
    })
    .select("id, job_id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // TODO: send confirmation email via Resend/SendGrid once configured

  let applyUrl: string | null = null;
  if (lead.job_id) {
    const { data: job } = await supabaseServiceRole
      .from("jobs")
      .select("apply_url")
      .eq("id", lead.job_id)
      .single();
    applyUrl = job?.apply_url ?? null;
  }

  return NextResponse.json({ id: lead.id, apply_url: applyUrl });
}
