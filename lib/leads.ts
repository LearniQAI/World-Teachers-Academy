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
