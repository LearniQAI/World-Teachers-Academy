import { supabaseServiceRole } from "@/lib/supabase";

export async function getApplyUrl(jobId: string | null): Promise<string | null> {
  if (!jobId) return null;
  const { data: job } = await supabaseServiceRole
    .from("jobs")
    .select("apply_url")
    .eq("id", jobId)
    .single();
  return job?.apply_url ?? null;
}

export async function createLead({
  name,
  email,
  jobId,
  sourceIp,
}: {
  name: string;
  email: string;
  jobId: string | null;
  sourceIp: string | null;
}): Promise<{ id: string; apply_url: string | null }> {
  const { data: lead, error } = await supabaseServiceRole
    .from("leads")
    .insert({
      name,
      email,
      job_id: jobId,
      consent_given: true,
      source_ip: sourceIp,
    })
    .select("id, job_id")
    .single();

  if (error) throw error;

  const applyUrl = await getApplyUrl(lead.job_id);
  return { id: lead.id, apply_url: applyUrl };
}

/** One record per visitor for the one-time verification. A second device
 * updates the same record; marketing consent only ever changes when the
 * visitor ticks the box (opting in) — it is never switched on silently. */
export async function recordPortalVisitor({
  name, email, marketingOptIn, sourceIp,
}: { name: string; email: string; marketingOptIn: boolean; sourceIp: string | null }): Promise<string> {
  const now = new Date().toISOString();
  const { data: existing } = await supabaseServiceRole
    .from("leads")
    .select("id, marketing_opt_in")
    .eq("email", email)
    .eq("purpose", "portal_access")
    .maybeSingle();
  if (existing) {
    const update: Record<string, unknown> = { name, last_verified_at: now, source_ip: sourceIp };
    if (marketingOptIn && !existing.marketing_opt_in) {
      Object.assign(update, { marketing_opt_in: true, marketing_opt_in_at: now, consent_given: true });
    }
    const { error } = await supabaseServiceRole.from("leads").update(update).eq("id", existing.id);
    if (error) throw error;
    return existing.id as string;
  }
  const { data, error } = await supabaseServiceRole
    .from("leads")
    .insert({
      name, email, job_id: null, purpose: "portal_access", source_ip: sourceIp, last_verified_at: now,
      marketing_opt_in: marketingOptIn, marketing_opt_in_at: marketingOptIn ? now : null, consent_given: marketingOptIn,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
