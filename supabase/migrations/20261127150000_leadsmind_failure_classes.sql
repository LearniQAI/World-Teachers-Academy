-- LeadsMind sync: failure classes for automatic recovery (docs/leadsmind-sync.md).
-- Replaces one function and adds one; no table or row is changed.
--
-- Before: after any successful delivery every dead row except deleted leads
-- was re-queued, so a row LeadsMind rejects for its own data (e.g. 422) was
-- retried again and again. Now only rows that failed for a reason affecting
-- every applicant (outage or form/configuration problem) are re-queued.

-- Mirrors failureKind() in lib/leadsmind.ts. Keep the two in step.
create or replace function public.leadsmind_failure_kind(p_error text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_error = 'lead_not_found' then 'gone'
    when p_error ~ '^http_[0-9]{3}$' then
      case
        when substr(p_error, 6)::int in (408, 429) or substr(p_error, 6)::int >= 500 then 'transient'
        when substr(p_error, 6)::int in (400, 409, 413, 422) then 'invalid'
        when substr(p_error, 6)::int >= 400 then 'config'
        else 'transient'
      end
    else 'transient'
  end;
$$;

-- Automatic recovery once LeadsMind accepts a lead again: only rows that died
-- of an outage or a configuration error (unpublished form, access refused).
-- Invalid applicant data and deleted leads are never re-queued here; invalid
-- rows have their own daily probe (at most 7) and the admin "retry".
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
                 where status = 'dead'
                   and public.leadsmind_failure_kind(last_error) in ('transient', 'config')
                 order by created_at limit greatest(1, least(p_limit, 1000)));
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.leadsmind_failure_kind(text) from public, anon, authenticated;
grant execute on function public.leadsmind_failure_kind(text) to service_role;
revoke all on function public.revive_dead_leadsmind_outbox(int) from public, anon, authenticated;
grant execute on function public.revive_dead_leadsmind_outbox(int) to service_role;
