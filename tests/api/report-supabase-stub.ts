export const calls: { fn: string; args: Record<string, unknown> }[] = [];
export let mode: "ok" | "missing" | "error" | "hidden" = "ok";
export function setMode(m: typeof mode) { mode = m; }
export const supabaseServiceRole = {
  rpc: async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args });
    if (mode === "missing") return { data: null, error: { message: "Could not find the function public.report_job(p_job_id, p_note, p_reason) in the schema cache" } };
    if (mode === "error") return { data: null, error: { message: "connection reset" } };
    return { data: mode === "hidden" ? "not_visible" : "recorded", error: null };
  },
};
export const supabaseAnon = supabaseServiceRole;
