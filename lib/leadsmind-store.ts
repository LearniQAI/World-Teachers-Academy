import { supabaseServiceRole } from "@/lib/supabase";
import { getLeadsMindConfig, processOutbox, type OutboxStore, type ProcessSummary } from "@/lib/leadsmind";

// Supabase implementation of the LeadsMind outbox (table: leadsmind_outbox,
// migration 20261126190000). Server-side only: uses the service role.

export const supabaseOutboxStore: OutboxStore = {
  async enqueue(leadId, formId) {
    const { data, error } = await supabaseServiceRole
      .from("leadsmind_outbox")
      .upsert({ lead_id: leadId, form_id: formId }, { onConflict: "lead_id,form_id", ignoreDuplicates: true })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(`enqueue failed (${error.code ?? "unknown"})`);
    return data?.id ?? null;
  },

  async claim({ limit, id }) {
    const { data, error } = await supabaseServiceRole.rpc("claim_leadsmind_outbox", {
      p_limit: limit,
      p_id: id ?? null,
    });
    if (error) throw new Error(`claim failed (${error.code ?? "unknown"})`);
    return data ?? [];
  },

  async loadLead(leadId) {
    const { data, error } = await supabaseServiceRole
      .from("leads")
      .select("name, email, job_id, jobs(title)")
      .eq("id", leadId)
      .maybeSingle();
    if (error) throw new Error(`load lead failed (${error.code ?? "unknown"})`);
    if (!data) return null;
    const job = (Array.isArray(data.jobs) ? data.jobs[0] : data.jobs) as { title?: string } | null;
    return { name: data.name, email: data.email, jobId: data.job_id, jobTitle: job?.title ?? null };
  },

  async markSent(id, status) {
    const { error } = await supabaseServiceRole
      .from("leadsmind_outbox")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        last_status_code: status,
        last_error: null,
        locked_until: null,
      })
      .eq("id", id);
    if (error) throw new Error(`markSent failed (${error.code ?? "unknown"})`);
  },

  async markFailed(id, { status, error: reason, dead, nextAttemptAt }) {
    const { error } = await supabaseServiceRole
      .from("leadsmind_outbox")
      .update({
        status: dead ? "dead" : "pending",
        last_status_code: status,
        last_error: reason.slice(0, 200),
        next_attempt_at: nextAttemptAt.toISOString(),
        locked_until: null,
      })
      .eq("id", id);
    if (error) throw new Error(`markFailed failed (${error.code ?? "unknown"})`);
  },
};

/** Queues a verified lead. Returns the outbox id, or null if it couldn't be queued. */
export async function enqueueLeadForLeadsMind(leadId: string): Promise<string | null> {
  const { config } = getLeadsMindConfig();
  if (!config.enabled) return null;
  try {
    return await supabaseOutboxStore.enqueue(leadId, config.formId);
  } catch (err) {
    // The retry job's safety net (enqueue_missing_leadsmind_leads) picks it up.
    console.error("[leadsmind] could not queue lead:", err instanceof Error ? err.message : "unknown");
    return null;
  }
}

export function runLeadsMindOutbox(opts: { limit?: number; id?: string | null } = {}): Promise<ProcessSummary> {
  return processOutbox(supabaseOutboxStore, opts);
}

/** Queues verified leads that were missed (only those applied at/after `since`). */
export async function enqueueMissingLeads(since: Date): Promise<number> {
  const { config } = getLeadsMindConfig();
  if (!config.enabled) return 0;
  const { data, error } = await supabaseServiceRole.rpc("enqueue_missing_leadsmind_leads", {
    p_form_id: config.formId,
    p_since: since.toISOString(),
  });
  if (error) throw new Error(`backfill failed (${error.code ?? "unknown"})`);
  return typeof data === "number" ? data : 0;
}
