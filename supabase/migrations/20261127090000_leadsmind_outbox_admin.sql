-- Admin visibility, manual retry and retention for leadsmind_outbox
-- (see docs/leadsmind-sync.md). Service role only, like the table itself.

-- Counts per status plus the age of the oldest unsent lead. No personal data.
create or replace function public.leadsmind_outbox_summary()
returns table (
  status text,
  rows_count bigint,
  oldest_created_at timestamptz,
  newest_created_at timestamptz,
  max_attempts int
)
language sql
stable
security definer
set search_path = public
as $$
  select o.status, count(*), min(o.created_at), max(o.created_at), max(o.attempts)
    from public.leadsmind_outbox o
   group by o.status
   order by o.status;
$$;

-- Manual retry: puts one 'dead' or 'pending' row back in the queue now, with
-- a fresh attempt budget. 'sent' rows are never resent (that would duplicate
-- the submission), and a row currently being sent is left alone.
-- Returns true when the row was re-queued.
create or replace function public.retry_leadsmind_outbox(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  changed int;
begin
  update public.leadsmind_outbox
     set status = 'pending',
         attempts = 0,
         next_attempt_at = now(),
         locked_until = null
   where id = p_id
     and status in ('dead', 'pending');
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

-- Re-queues every 'dead' row (after the cause, e.g. a wrong form id, is fixed).
create or replace function public.retry_dead_leadsmind_outbox()
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
   where status = 'dead';
  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Retention: delivered rows are only needed as a short audit trail. Rows
-- 'sent' more than p_days ago are deleted; 'pending' and 'dead' rows are kept
-- until they are delivered or handled. (The queue holds no names or emails;
-- those live in `leads`, whose retention is unchanged by this feature.)
create or replace function public.purge_sent_leadsmind_outbox(p_days int default 180)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  removed int;
begin
  delete from public.leadsmind_outbox
   where status = 'sent'
     and sent_at < now() - make_interval(days => greatest(p_days, 30));
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.leadsmind_outbox_summary() from public, anon, authenticated;
revoke all on function public.retry_leadsmind_outbox(uuid) from public, anon, authenticated;
revoke all on function public.retry_dead_leadsmind_outbox() from public, anon, authenticated;
revoke all on function public.purge_sent_leadsmind_outbox(int) from public, anon, authenticated;
grant execute on function public.leadsmind_outbox_summary() to service_role;
grant execute on function public.retry_leadsmind_outbox(uuid) to service_role;
grant execute on function public.retry_dead_leadsmind_outbox() to service_role;
grant execute on function public.purge_sent_leadsmind_outbox(int) to service_role;
