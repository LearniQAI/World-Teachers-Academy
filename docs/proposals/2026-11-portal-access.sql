-- =============================================================================
-- PROPOSAL ONLY — NOT A MIGRATION. Staging first; production only with approval.
-- Verified access for the Job Portal: protected apply links, server-side
-- sessions, separate marketing consent, and retention functions.
-- Tested by tests/db/portal-access.test.sql on a local Postgres 17/16.
--
-- 1. Protected apply links. Today the public (anon) key can read every column
--    of `jobs`, apply_url included, straight from the Supabase REST API, so
--    verification can be skipped. Column privileges fix this: anon and
--    authenticated may read every column EXCEPT apply_url. The website reads
--    apply_url with the service role, and only for verified browsers.
--    RLS still limits rows to active jobs; column grants limit columns.
-- 2. portal_sessions: one row per verified browser. The cookie carries the
--    session id (signed). Sign-out and revocation are server-side, so a copied
--    cookie stops working as soon as the session is revoked.
-- 3. Marketing consent separate from access: leads.marketing_opt_in (default
--    false). The old rule "consent_given must be true" is lifted for new rows;
--    old rows keep their values untouched.
-- 4. Retention functions (not scheduled): run only after the retention policy
--    is approved. They never touch rows younger than the stated periods.
-- Nothing in this file deletes or changes an existing visitor record.
-- =============================================================================
begin;

-- 1. Protected apply links ------------------------------------------------------
revoke select on table public.jobs from anon, authenticated;
-- Grant every current column except the protected links. (Re-run this block
-- whenever a column is added to jobs, or the new column stays hidden.)
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
    from information_schema.columns
   where table_schema = 'public' and table_name = 'jobs'
     and column_name not in ('apply_url', 'source_url');
  execute format('grant select (%s) on table public.jobs to anon, authenticated', cols);
end $$;
-- apply_url (and source_url, the official listing page, where it exists): service role only.
comment on column public.jobs.apply_url is
  'Protected: readable by the service role only; served to verified browsers by /api/jobs.';

-- 2. Sessions ----------------------------------------------------------------------
create table if not exists public.portal_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_reason text check (revoked_reason in ('signed_out','revoked_by_admin','revoked_all','visitor_deleted')),
  last_seen_at timestamptz
);
create index if not exists portal_sessions_lead_idx on public.portal_sessions (lead_id);
create index if not exists portal_sessions_expires_idx on public.portal_sessions (expires_at);
alter table public.portal_sessions enable row level security;  -- no policies: service role only
revoke all on table public.portal_sessions from anon, authenticated;

-- Revoke every session of one visitor (by email), e.g. on request or abuse.
create or replace function public.revoke_portal_access(p_email text, p_reason text default 'revoked_by_admin')
returns int language sql as $$
  with s as (
    update public.portal_sessions ps set revoked_at = now(), revoked_reason = p_reason
      from public.leads l
     where ps.lead_id = l.id and l.email = lower(trim(p_email)) and ps.revoked_at is null
    returning ps.id)
  select count(*)::int from s
$$;

-- 3. Marketing consent separate from access -------------------------------------------
alter table public.leads
  add column if not exists purpose text not null default 'job_apply_gate'
    check (purpose in ('job_apply_gate','portal_access')),
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists marketing_opt_in_at timestamptz,
  add column if not exists marketing_opt_out_at timestamptz,
  add column if not exists last_verified_at timestamptz;
-- Old rows were created under the bundled wording; they keep consent_given = true.
-- New portal-access rows record marketing separately, so the bundled rule is lifted.
alter table public.leads drop constraint if exists consent_required;
comment on column public.leads.consent_given is
  'Legacy (before verify-once): bundled consent. New rows: equals marketing_opt_in.';

alter table public.email_otps
  add column if not exists marketing_opt_in boolean not null default false;

-- Visitors who opt out are remembered only as a one-way hash of their email,
-- so a deleted visitor is never emailed again (POPIA "do not contact").
create table if not exists public.marketing_suppressions (
  email_sha256 text primary key,
  created_at timestamptz not null default now()
);
alter table public.marketing_suppressions enable row level security;
revoke all on table public.marketing_suppressions from anon, authenticated;

revoke all on table public.leads, public.email_otps from anon, authenticated;

-- 4. Retention (run only after the policy is approved; nothing schedules these) ---------
-- Periods are parameters so the approved values are set in one place.
create or replace function public.apply_visitor_retention(
  p_otp_days int default 1,            -- verification codes: 1 day after creation
  p_session_days int default 30,       -- sessions: 30 days after they expire or are revoked
  p_ip_days int default 90,            -- IP addresses on leads: blanked after 90 days
  p_inactive_months int default 24     -- visitor contact details: 24 months after last verification
) returns jsonb language plpgsql as $$
declare v_otps int; v_sessions int; v_ips int; v_leads int;
begin
  if p_otp_days < 1 or p_session_days < 1 or p_ip_days < 30 or p_inactive_months < 6 then
    raise exception 'retention periods below the safety minimums';
  end if;
  with d as (delete from public.email_otps where created_at < now() - make_interval(days => p_otp_days) returning 1)
  select count(*) into v_otps from d;
  with d as (delete from public.portal_sessions
              where coalesce(revoked_at, expires_at) < now() - make_interval(days => p_session_days) returning 1)
  select count(*) into v_sessions from d;
  with u as (update public.leads set source_ip = null
              where source_ip is not null and applied_at < now() - make_interval(days => p_ip_days) returning 1)
  select count(*) into v_ips from u;
  -- Inactive visitors: remove contact details; keep an anonymous row for counts.
  with u as (
    update public.leads l set name = '[removed]', email = 'removed+' || l.id || '@invalid', source_ip = null,
                              marketing_opt_in = false
     where coalesce(l.last_verified_at, l.applied_at) < now() - make_interval(months => p_inactive_months)
       and l.email not like 'removed+%'
       and not exists (select 1 from public.portal_sessions s where s.lead_id = l.id
                        and s.revoked_at is null and s.expires_at > now())
    returning 1)
  select count(*) into v_leads from u;
  return jsonb_build_object('otps_deleted', v_otps, 'sessions_deleted', v_sessions,
                            'ips_blanked', v_ips, 'visitors_anonymised', v_leads);
end $$;

-- Data-subject request: export everything held about one email address.
create or replace function public.export_visitor_data(p_email text) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'leads', coalesce((select jsonb_agg(to_jsonb(l) - 'id') from public.leads l where l.email = lower(trim(p_email))), '[]'),
    'sessions', coalesce((select jsonb_agg(jsonb_build_object('created_at', s.created_at, 'expires_at', s.expires_at,
                                   'revoked_at', s.revoked_at)) from public.portal_sessions s
                           join public.leads l on l.id = s.lead_id where l.email = lower(trim(p_email))), '[]'),
    'pending_codes', (select count(*) from public.email_otps o where o.email = lower(trim(p_email))))
$$;

-- Data-subject request: erase one visitor (after identity is confirmed).
create or replace function public.erase_visitor(p_email text) returns jsonb language plpgsql as $$
declare v_email text := lower(trim(p_email)); v_sessions int; v_leads int; v_otps int;
begin
  insert into public.marketing_suppressions (email_sha256)
  values (encode(sha256(convert_to(v_email, 'UTF8')), 'hex')) on conflict do nothing;
  with u as (update public.portal_sessions s set revoked_at = coalesce(revoked_at, now()), revoked_reason = 'visitor_deleted'
              from public.leads l where s.lead_id = l.id and l.email = v_email returning 1)
  select count(*) into v_sessions from u;
  with u as (update public.leads set name = '[removed]', email = 'removed+' || id || '@invalid', source_ip = null,
                                      marketing_opt_in = false, marketing_opt_out_at = coalesce(marketing_opt_out_at, now())
              where email = v_email returning 1)
  select count(*) into v_leads from u;
  with d as (delete from public.email_otps where email = v_email returning 1) select count(*) into v_otps from d;
  return jsonb_build_object('sessions_revoked', v_sessions, 'visitors_anonymised', v_leads, 'codes_deleted', v_otps);
end $$;

revoke execute on function public.revoke_portal_access(text, text), public.apply_visitor_retention(int, int, int, int),
  public.export_visitor_data(text), public.erase_visitor(text) from public, anon, authenticated;

commit;

-- Roll back (keeps every row):
-- begin;
--   grant select on table public.jobs to anon, authenticated;
--   drop function if exists public.revoke_portal_access(text,text), public.apply_visitor_retention(int,int,int,int),
--     public.export_visitor_data(text), public.erase_visitor(text);
--   -- portal_sessions, marketing_suppressions and the new columns stay (harmless history);
--   -- the consent_required rule is not re-added because new rows may have consent_given = false.
-- commit;
