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
   where id in (select id from public.leadsmind_outbox where status = 'dead'
                 order by created_at limit greatest(1, least(p_limit, 1000)));
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.revive_dead_leadsmind_outbox(int) from public, anon, authenticated;
grant execute on function public.revive_dead_leadsmind_outbox(int) to service_role;
revoke all on function public.preview_missing_leadsmind_leads(text, timestamptz) from public, anon, authenticated;
revoke all on function public.leadsmind_outbox_health(int) from public, anon, authenticated;
revoke all on function public.record_leadsmind_alert(text, text, boolean) from public, anon, authenticated;
grant execute on function public.preview_missing_leadsmind_leads(text, timestamptz) to service_role;
grant execute on function public.leadsmind_outbox_health(int) to service_role;
grant execute on function public.record_leadsmind_alert(text, text, boolean) to service_role;
