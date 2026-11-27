-- LeadsMind sync: recovery (backfill preview), health statistics and alert
-- de-duplication (F2, F3 in docs/leadsmind-sync.md). Additive only: one new
-- table and three functions; no existing table or row is changed.
-- Everything is service-role only and returns no personal data.

-- Remembers which alerts were sent, so the same condition is not emailed
-- again and again (see lib/leadsmind.ts planAlerts).
create table public.leadsmind_alert_state (
  kind text primary key check (kind in ('critical', 'daily_summary', 'resolved')),
  fingerprint text,
  last_sent_at timestamptz,
  -- last time sending this alert was attempted (failed sends are retried no
  -- more than every 15 minutes, see planAlerts)
  last_attempt_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.leadsmind_alert_state enable row level security;
create policy "Service role can do anything"
  on public.leadsmind_alert_state for all
  using (auth.role() = 'service_role');

-- Dry run for the backfill: how many verified leads since p_since have no
-- queue row for this form. Counts and dates only.
create or replace function public.preview_missing_leadsmind_leads(
  p_form_id text,
  p_since timestamptz
)
returns table (missing bigint, oldest_applied_at timestamptz, newest_applied_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select count(*), min(l.applied_at), max(l.applied_at)
    from public.leads l
   where l.applied_at >= p_since
     and not exists (
       select 1 from public.leadsmind_outbox o
        where o.lead_id = l.id and o.form_id = p_form_id
     );
$$;

-- One-call health snapshot for the admin view and the alerts.
create or replace function public.leadsmind_outbox_health(p_stale_after_minutes int default 120)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'counts', coalesce((select jsonb_object_agg(status, n) from (
                 select status, count(*) n from public.leadsmind_outbox group by status) s), '{}'::jsonb),
    'oldest_pending_at', (select min(created_at) from public.leadsmind_outbox where status in ('pending', 'sending')),
    'stale_pending', (select count(*) from public.leadsmind_outbox
                       where status in ('pending', 'sending')
                         and created_at < now() - make_interval(mins => greatest(p_stale_after_minutes, 1))),
    'dead', (select count(*) from public.leadsmind_outbox where status = 'dead'),
    'oldest_dead_at', (select min(created_at) from public.leadsmind_outbox where status = 'dead'),
    'last_sent_at', (select max(sent_at) from public.leadsmind_outbox where status = 'sent'),
    'error_classes', coalesce((select jsonb_object_agg(last_error, n) from (
                 select last_error, count(*) n from public.leadsmind_outbox
                  where status in ('pending', 'dead') and last_error is not null group by last_error) e), '{}'::jsonb),
    'checked_at', now()
  );
$$;

-- Records that an alert of this kind was sent (or cleared with p_sent = false).
create or replace function public.record_leadsmind_alert(p_kind text, p_fingerprint text, p_sent boolean)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.leadsmind_alert_state (kind, fingerprint, last_sent_at, updated_at)
  values (p_kind, p_fingerprint, case when p_sent then now() end, now())
  on conflict (kind) do update
     set fingerprint = excluded.fingerprint,
         last_sent_at = case when p_sent then now() else public.leadsmind_alert_state.last_sent_at end,
         updated_at = now();
$$;

-- Automatic recovery after a prolonged outage: once a delivery succeeds again,
-- rows that had given up ('dead') are put back in the queue, so recovery does
-- not depend on someone pressing "retry dead". Bounded per call.
create or replace function public.revive_dead_leadsmind_outbox(p_limit int default 100)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  changed int;
begin
  update public.leadsmind_outbox
     set status = 'pending', attempts = 0, next_attempt_at = now(), locked_until = null
   where id in (select id from public.leadsmind_outbox
                 where status = 'dead' and coalesce(last_error, '') <> 'lead_not_found'
                 order by created_at limit greatest(1, least(p_limit, 1000)));
  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Recovery probe: claims at most ONE dead row whose probe time has come, so a
-- recovered LeadsMind is noticed even when no new applicant arrives. SKIP
-- LOCKED + lease: parallel runs never probe the same row.
create or replace function public.claim_leadsmind_probe(p_lease_seconds int default 120)
returns setof public.leadsmind_outbox
language sql
security definer
set search_path = public
as $$
  update public.leadsmind_outbox o
     set status = 'sending',
         attempts = o.attempts + 1,
         locked_until = now() + make_interval(secs => p_lease_seconds)
   where o.id = (
     select c.id from public.leadsmind_outbox c
      where c.status = 'dead'
        and c.next_attempt_at <= now()
        and coalesce(c.last_error, '') <> 'lead_not_found'
      order by c.next_attempt_at
      limit 1
      for update skip locked
   )
  returning o.*;
$$;

-- After a failed probe: hold back the other dead rows until p_until, so there
-- is at most one probe per interval however many rows are dead. p_last_error
-- null = all dead rows (an outage); otherwise only rows with that error.
create or replace function public.defer_leadsmind_probes(p_until timestamptz, p_last_error text default null)
returns void
language sql
security definer
set search_path = public
as $$
  update public.leadsmind_outbox
     set next_attempt_at = greatest(next_attempt_at, p_until)
   where status = 'dead'
     and (p_last_error is null or last_error = p_last_error);
$$;

-- Notes that an alert send was attempted (successful or not).
create or replace function public.record_leadsmind_alert_attempt(p_kind text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.leadsmind_alert_state (kind, last_attempt_at, updated_at)
  values (p_kind, now(), now())
  on conflict (kind) do update set last_attempt_at = now(), updated_at = now();
$$;

revoke all on function public.claim_leadsmind_probe(int) from public, anon, authenticated;
revoke all on function public.defer_leadsmind_probes(timestamptz, text) from public, anon, authenticated;
grant execute on function public.defer_leadsmind_probes(timestamptz, text) to service_role;
revoke all on function public.record_leadsmind_alert_attempt(text) from public, anon, authenticated;
grant execute on function public.claim_leadsmind_probe(int) to service_role;
grant execute on function public.record_leadsmind_alert_attempt(text) to service_role;
revoke all on function public.revive_dead_leadsmind_outbox(int) from public, anon, authenticated;
grant execute on function public.revive_dead_leadsmind_outbox(int) to service_role;
revoke all on function public.preview_missing_leadsmind_leads(text, timestamptz) from public, anon, authenticated;
revoke all on function public.leadsmind_outbox_health(int) from public, anon, authenticated;
revoke all on function public.record_leadsmind_alert(text, text, boolean) from public, anon, authenticated;
grant execute on function public.preview_missing_leadsmind_leads(text, timestamptz) to service_role;
grant execute on function public.leadsmind_outbox_health(int) to service_role;
grant execute on function public.record_leadsmind_alert(text, text, boolean) to service_role;
