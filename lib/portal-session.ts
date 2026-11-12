import { supabaseServiceRole } from "@/lib/supabase";
import { ACCESS_COOKIE, accessDays, readAccessToken, signAccessToken, type Payload } from "@/lib/portal-access";

// Server-side sessions for the one-time verification
// (docs/proposals/2026-11-portal-access.sql, table portal_sessions).
// A cookie is accepted only if its signature is valid AND its session row
// exists, isn't revoked and hasn't expired.

type CookieReader = { get(name: string): { value: string } | undefined };

export async function createSession(leadId: string): Promise<{ token: string; expires: Date } | null> {
  const expires = new Date(Date.now() + accessDays() * 86_400_000);
  const { data, error } = await supabaseServiceRole
    .from("portal_sessions")
    .insert({ lead_id: leadId, expires_at: expires.toISOString() })
    .select("id")
    .single();
  if (error || !data) return null;
  return signAccessToken(leadId, data.id as string, new Date(), expires);
}

export async function currentSession(cookies: CookieReader): Promise<Payload | null> {
  const p = readAccessToken(cookies.get(ACCESS_COOKIE)?.value);
  if (!p) return null;
  const { data } = await supabaseServiceRole
    .from("portal_sessions")
    .select("id, lead_id, expires_at, revoked_at")
    .eq("id", p.sid)
    .maybeSingle();
  if (!data || data.lead_id !== p.lid || data.revoked_at || new Date(data.expires_at as string) <= new Date()) return null;
  return p;
}

export async function revokeSessions(p: Payload, everywhere: boolean): Promise<void> {
  const q = supabaseServiceRole
    .from("portal_sessions")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "signed_out" })
    .is("revoked_at", null);
  await (everywhere ? q.eq("lead_id", p.lid) : q.eq("id", p.sid));
}
