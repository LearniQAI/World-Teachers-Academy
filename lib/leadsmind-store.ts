import { supabaseServiceRole } from "@/lib/supabase";
import {
  getLeadsMindConfig,
  planAlerts,
  processOutbox,
  type AlertStateRow,
  type OutboxStore,
  type ProcessSummary,
  type QueueHealth,
} from "@/lib/leadsmind";
import { sendAlertEmail } from "@/lib/resend";

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

/**
 * Queues a verified lead. Runs whether or not the sync is enabled (F1):
 * LEADSMIND_DISABLED pauses delivery only, so leads verified while paused are
 * kept and sent automatically once it is switched back on.
 */
export async function enqueueLeadForLeadsMind(leadId: string): Promise<string | null> {
  const { config } = getLeadsMindConfig();
  try {
    return await supabaseOutboxStore.enqueue(leadId, config.formId);
  } catch (err) {
    // The retry job's catch-up (enqueue_missing_leadsmind_leads) picks it up.
    console.error("[leadsmind] could not queue lead:", err instanceof Error ? err.message : "unknown");
    return null;
  }
}

export function runLeadsMindOutbox(opts: { limit?: number; id?: string | null } = {}): Promise<ProcessSummary> {
  return processOutbox(supabaseOutboxStore, opts);
}

/**
 * Queues verified leads applied at/after `since` that have no queue row (F2).
 * Set-based and idempotent (unique lead+form), so it is safe to run in
 * parallel and on any number of leads. Runs even while delivery is paused.
 */
export async function enqueueMissingLeads(since: Date): Promise<number> {
  const { config } = getLeadsMindConfig();
  const { data, error } = await supabaseServiceRole.rpc("enqueue_missing_leadsmind_leads", {
    p_form_id: config.formId,
    p_since: since.toISOString(),
  });
  if (error) throw new Error(`backfill failed (${error.code ?? "unknown"})`);
  return typeof data === "number" ? data : 0;
}

/** Dry run for enqueueMissingLeads: counts and dates only, nothing is queued. */
export async function previewMissingLeads(since: Date): Promise<{ missing: number; oldest_applied_at: string | null; newest_applied_at: string | null }> {
  const { config } = getLeadsMindConfig();
  const { data, error } = await supabaseServiceRole.rpc("preview_missing_leadsmind_leads", {
    p_form_id: config.formId,
    p_since: since.toISOString(),
  });
  if (error) throw new Error(`backfill preview failed (${error.code ?? "unknown"})`);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    missing: Number(row?.missing ?? 0),
    oldest_applied_at: row?.oldest_applied_at ?? null,
    newest_applied_at: row?.newest_applied_at ?? null,
  };
}

export async function getQueueHealth(): Promise<QueueHealth> {
  const { data, error } = await supabaseServiceRole.rpc("leadsmind_outbox_health", { p_stale_after_minutes: 120 });
  if (error) throw new Error(`health failed (${error.code ?? "unknown"})`);
  return data as QueueHealth;
}

/**
 * F3: emails sync alerts to LEADSMIND_ALERT_EMAIL when planAlerts says so.
 * Never throws. Returns the kinds sent, for the retry job's log line.
 */
export async function runLeadsMindAlerts(now = new Date()): Promise<string[]> {
  const { config, problems } = getLeadsMindConfig();
  if (!config.alertEmail) return [];
  try {
    const health = await getQueueHealth();
    const { data: state } = await supabaseServiceRole.from("leadsmind_alert_state").select("kind, fingerprint, last_sent_at");
    const planned = planAlerts(health, problems, (state ?? []) as AlertStateRow[], now);
    const sent: string[] = [];
    for (const alert of planned) {
      try {
        await sendAlertEmail(config.alertEmail, alert.subject, alert.text);
        await supabaseServiceRole.rpc("record_leadsmind_alert", { p_kind: alert.kind, p_fingerprint: alert.fingerprint, p_sent: true });
        if (alert.kind === "resolved") {
          await supabaseServiceRole.rpc("record_leadsmind_alert", { p_kind: "critical", p_fingerprint: "", p_sent: false });
        }
        sent.push(alert.kind);
      } catch (err) {
        console.error(`[leadsmind-alert] ${alert.kind} not sent:`, err instanceof Error ? err.name : "unknown");
      }
    }
    return sent;
  } catch (err) {
    console.error("[leadsmind-alert] check failed:", err instanceof Error ? err.message : "unknown");
    return [];
  }
}
