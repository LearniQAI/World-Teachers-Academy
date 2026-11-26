-- LeadsMind CRM sync for verified job-portal leads (see lib/leadsmind.ts).
--
-- Every lead that passes email verification gets one row here. The row is the
-- durable record of "this lead must reach LeadsMind": it is written before the
-- applicant's response is sent, delivered right after, and retried with
-- back-off until LeadsMind accepts it. Rows are never deleted by the sync, so
-- a lead that keeps failing stays visible as status = 'dead'.
--
-- No personal data is copied here: name and email are read from `leads` at
-- send time. Errors store only an HTTP status and a short error class.

create table public.leadsmind_outbox (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  form_id text not null,
  -- Sent to LeadsMind as client_submission_id. It never changes across
  -- retries, so if LeadsMind stored a submission but the response was lost,
  -- the retry is recognised there and no second submission is created.
  client_submission_id uuid not null default gen_random_uuid() unique,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'dead')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  locked_until timestamptz,
  last_status_code int,
  last_error text check (last_error is null or char_length(last_error) <= 200),
  -- Email verification is NOT marketing consent. The job portal does not
  -- collect marketing consent, so nothing is ever sent to LeadsMind's
  -- marketing-consent field and this stays false.
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (lead_id, form_id)
);

create index leadsmind_outbox_due_idx
  on public.leadsmind_outbox (next_attempt_at)
  where status in ('pending', 'sending');

alter table public.leadsmind_outbox enable row level security;

-- No public access. Only the service role (server-side code) uses this table.
create policy "Service role can do anything"
  on public.leadsmind_outbox for all
  using (auth.role() = 'service_role');

-- Claims due rows for delivery. FOR UPDATE SKIP LOCKED plus a lease means two
-- workers (e.g. the post-verify send and the retry job) never send the same
-- row at the same time; a worker that crashes mid-send releases its rows
-- when the lease expires. p_id claims one specific row (the inline send).
create or replace function public.claim_leadsmind_outbox(
  p_limit int default 10,
  p_id uuid default null,
  p_lease_seconds int default 120
)
returns setof public.leadsmind_outbox
language sql
security definer
set search_path = public
as $$
  update public.leadsmind_outbox o
     set status = 'sending',
         attempts = o.attempts + 1,
         locked_until = now() + make_interval(secs => p_lease_seconds)
   where o.id in (
     select c.id
       from public.leadsmind_outbox c
      where (p_id is null or c.id = p_id)
        and (
          (c.status = 'pending' and c.next_attempt_at <= now())
          or (c.status = 'sending' and c.locked_until < now())
        )
      order by c.next_attempt_at
      limit greatest(1, least(p_limit, 50))
      for update skip locked
   )
  returning o.*;
$$;

-- Safety net: queues verified leads that have no outbox row (e.g. the outbox
-- insert failed during verification). Only leads applied at/after p_since are
-- considered, so historical leads are never sent unless explicitly asked for.
create or replace function public.enqueue_missing_leadsmind_leads(
  p_form_id text,
  p_since timestamptz
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted int;
begin
  insert into public.leadsmind_outbox (lead_id, form_id)
  select l.id, p_form_id
    from public.leads l
   where l.applied_at >= p_since
     and not exists (
       select 1 from public.leadsmind_outbox o
        where o.lead_id = l.id and o.form_id = p_form_id
     )
  on conflict (lead_id, form_id) do nothing;
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.claim_leadsmind_outbox(int, uuid, int) from public, anon, authenticated;
revoke all on function public.enqueue_missing_leadsmind_leads(text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_leadsmind_outbox(int, uuid, int) to service_role;
grant execute on function public.enqueue_missing_leadsmind_leads(text, timestamptz) to service_role;
