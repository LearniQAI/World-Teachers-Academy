-- =============================================================================
-- PROPOSAL ONLY — NOT A MIGRATION. DO NOT APPLY WITHOUT THE OWNER'S APPROVAL.
-- Version 2 (Phase B). Kept outside supabase/migrations on purpose, so
-- `supabase db push` and branch deploys cannot pick it up.
--
-- Target when approved: a STAGING project first, then WTA production
-- ("WorldTeachersAcademy", nxwmtcsezswjrignajdm).
--
-- What it adds (nothing is deleted, ever):
--   * jobs.status + reason, closing dates, eligibility, pay period, source info
--   * job_source_runs  — one row per feed import run (outage guard, alerts)
--   * job_checks       — one row per verification check (evidence)
--   * job_status_events— one row per status change (audit trail)
--   * job_alerts       — unusual events for the alert e-mail
--   * job_reports      — visitor reports ("Report an unavailable job")
--   * functions that hold ALL the removal rules, so they are tested in one place:
--       begin_source_run, upsert_feed_jobs, finish_source_run,
--       expire_jobs, claim_jobs_for_check, record_check, mark_duplicates,
--       report_job
--   * public read policy based on status and closing date
--
-- Tested with tests/db/verification.test.sql on a local Postgres 16.
-- =============================================================================

begin;

-- 1. Columns on jobs --------------------------------------------------------------
alter table jobs
  add column if not exists status text not null default 'active',
  add column if not exists status_reason text,
  add column if not exists status_changed_at timestamptz,
  add column if not exists closes_at timestamptz,             -- deadline, only when the source gives one
  add column if not exists eligibility text,                  -- verbatim from the source (e.g. USAJOBS "Who may apply")
  add column if not exists is_restricted boolean not null default false, -- true when not open to everyone
  add column if not exists salary_period text check (salary_period in ('year','month','week','day','hour')),
  add column if not exists salary_is_predicted boolean not null default false, -- Adzuna estimate, never shown as fact
  add column if not exists source_name text,                  -- visitor-facing label
  add column if not exists source_url text,
  add column if not exists first_seen_at timestamptz default now(),
  add column if not exists last_seen_in_feed_at timestamptz,
  add column if not exists last_seen_run_id bigint,
  add column if not exists consecutive_missing int not null default 0,
  add column if not exists last_checked_at timestamptz,       -- any check, any outcome
  add column if not exists last_confirmed_open_at timestamptz,-- only when the SOURCE says it is accepting applications
  add column if not exists next_check_at timestamptz,
  add column if not exists check_lock_until timestamptz,      -- claimed by a verification worker
  add column if not exists consecutive_transient int not null default 0,
  add column if not exists link_failure_since timestamptz,    -- first "not found" in the current failure streak
  add column if not exists consecutive_link_failures int not null default 0,
  add column if not exists fingerprint text,
  add column if not exists duplicate_of uuid references jobs(id);

alter table jobs drop constraint if exists jobs_status_check;
alter table jobs add constraint jobs_status_check check (status in (
  'active',            -- shown
  'uncertain',         -- shown; checks could not get a clear answer (retrying)
  'expired',           -- hidden; closing date passed, or stale with no closing date
  'removed_at_source', -- hidden; missing from 2 complete runs, or the source's API says it is gone
  'link_unavailable',  -- hidden; apply link "not found" twice, 12h+ apart
  'filled',            -- hidden; the source says it is filled/closed
  'duplicate',         -- hidden; another row is the preferred copy (duplicate_of)
  'not_relevant'       -- hidden; not an education role
));

-- Back-fill: nothing changes for visitors on day one.
update jobs set status = case when is_active then 'active' else 'removed_at_source' end,
                status_reason = case when is_active then null else 'legacy_inactive' end,
                status_changed_at = coalesce(status_changed_at, updated_at),
                last_seen_in_feed_at = coalesce(last_seen_in_feed_at, case when is_active then updated_at end)
 where status_changed_at is null;

create index if not exists jobs_status_idx      on jobs (status);
create index if not exists jobs_scope_idx       on jobs (source, country, status);
create index if not exists jobs_next_check_idx  on jobs (next_check_at) where status in ('active','uncertain');
create index if not exists jobs_closes_at_idx   on jobs (closes_at) where status in ('active','uncertain');
create index if not exists jobs_fingerprint_idx on jobs (fingerprint) where fingerprint is not null;

-- 2. Audit and bookkeeping tables ---------------------------------------------------
create table if not exists job_source_runs (
  id bigint generated always as identity primary key,
  source text not null,
  scope text not null,           -- ISO country code, or '*' for a source covering many countries
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  complete boolean,              -- true only if every page was fetched without error
  fetched int not null default 0,  -- relevant + not relevant rows received in scope
  rejected int not null default 0, -- rows refused (e.g. country outside the run's scope)
  previous_fetched int,
  removals_applied boolean not null default false,
  guard_reason text,
  error text
);
create index if not exists job_source_runs_idx on job_source_runs (source, scope, started_at desc);

create table if not exists job_checks (
  id bigint generated always as identity primary key,
  job_id uuid not null references jobs(id),
  kind text not null check (kind in ('source_api','link')),
  outcome text not null check (outcome in ('confirmed_open','listed','gone','not_found','transient','blocked','unsupported')),
  http_status int,
  detail jsonb,
  checked_at timestamptz not null default now()
);
create index if not exists job_checks_job_idx on job_checks (job_id, checked_at desc);

create table if not exists job_status_events (
  id bigint generated always as identity primary key,
  job_id uuid not null references jobs(id),
  from_status text,
  to_status text not null,
  reason text not null,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists job_status_events_job_idx on job_status_events (job_id, created_at desc);

create table if not exists job_alerts (
  id bigint generated always as identity primary key,
  kind text not null,            -- 'count_drop' | 'run_failed' | 'mass_hide' | 'report_spike'
  source text,
  scope text,
  detail jsonb not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists job_reports (
  id bigint generated always as identity primary key,
  job_id uuid not null references jobs(id),
  reason text not null check (reason in ('link_broken','job_closed','wrong_details','not_a_teaching_job','other')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  outcome text
);  -- no personal data: no name, e-mail or IP address

-- 3. Triggers: keep is_active in step; log every status change -------------------------
create or replace function jobs_status_bookkeeping() returns trigger language plpgsql as $$
begin
  new.is_active := new.status in ('active','uncertain');
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists jobs_status_bookkeeping on jobs;
create trigger jobs_status_bookkeeping before insert or update on jobs
  for each row execute function jobs_status_bookkeeping();

create or replace function jobs_log_status_change() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    insert into job_status_events (job_id, from_status, to_status, reason)
    values (new.id, old.status, new.status, coalesce(new.status_reason, 'unspecified'));
  end if;
  return new;
end $$;
drop trigger if exists jobs_log_status_change on jobs;
create trigger jobs_log_status_change after update on jobs
  for each row execute function jobs_log_status_change();

-- 4. Feed runs -----------------------------------------------------------------------------
-- Start a run. Returns null if another run for the same source/scope is still in
-- progress (started < 30 min ago and not finished), so two imports never overlap.
create or replace function begin_source_run(p_source text, p_scope text) returns bigint
language plpgsql as $$
declare v_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext('job_run:' || p_source || ':' || p_scope));
  if exists (select 1 from job_source_runs
              where source = p_source and scope = p_scope and finished_at is null
                and started_at > now() - interval '30 minutes') then
    return null;
  end if;
  -- a run left unfinished for 30+ minutes counts as failed
  update job_source_runs set finished_at = now(), complete = false, error = coalesce(error, 'abandoned')
   where source = p_source and scope = p_scope and finished_at is null;
  insert into job_source_runs (source, scope) values (p_source, p_scope) returning id into v_id;
  return v_id;
end $$;

-- Upsert one page of normalised jobs (a JSON array) for a run.
-- Each element: {external_id,title,description,company_name,country,city,employment_type,
--   salary_min,salary_max,currency,salary_period,salary_is_predicted,apply_url,posted_at,
--   closes_at,eligibility,is_restricted,source_name,source_url,fingerprint,is_relevant}
create or replace function upsert_feed_jobs(p_run_id bigint, p_jobs jsonb) returns jsonb
language plpgsql as $$
declare
  r job_source_runs%rowtype;
  j jsonb;
  v_accepted int := 0;
  v_rejected int := 0;
begin
  select * into r from job_source_runs where id = p_run_id;
  if r.id is null or r.finished_at is not null then
    raise exception 'run % is not open', p_run_id;
  end if;

  for j in select * from jsonb_array_elements(p_jobs) loop
    -- Country guard: a country-scoped run may only touch its own country.
    if (j->>'country') is null or (j->>'country') !~ '^[A-Z]{2}$'
       or (r.scope <> '*' and (j->>'country') <> r.scope) then
      v_rejected := v_rejected + 1;
      continue;
    end if;

    insert into jobs as t (source, external_id, title, description, company_name, country, city,
                     employment_type, salary_min, salary_max, currency, salary_period, salary_is_predicted,
                     apply_url, posted_at, closes_at, eligibility, is_restricted, source_name, source_url,
                     fingerprint, status, status_reason, last_seen_run_id, last_seen_in_feed_at,
                     consecutive_missing, next_check_at)
    values (r.source, j->>'external_id', j->>'title', j->>'description', j->>'company_name', j->>'country',
            j->>'city', j->>'employment_type', (j->>'salary_min')::numeric, (j->>'salary_max')::numeric,
            j->>'currency', j->>'salary_period', coalesce((j->>'salary_is_predicted')::boolean, false),
            j->>'apply_url', (j->>'posted_at')::timestamptz, (j->>'closes_at')::timestamptz,
            j->>'eligibility', coalesce((j->>'is_restricted')::boolean, false), j->>'source_name',
            j->>'source_url', j->>'fingerprint',
            case when coalesce((j->>'is_relevant')::boolean, true) then 'active' else 'not_relevant' end,
            case when coalesce((j->>'is_relevant')::boolean, true) then 'new_in_feed' else 'title_not_education' end,
            p_run_id, now(), 0, now())
    on conflict (source, external_id) do update set
      title = excluded.title, description = excluded.description, company_name = excluded.company_name,
      country = excluded.country, city = excluded.city, employment_type = excluded.employment_type,
      salary_min = excluded.salary_min, salary_max = excluded.salary_max, currency = excluded.currency,
      salary_period = excluded.salary_period, salary_is_predicted = excluded.salary_is_predicted,
      apply_url = excluded.apply_url, posted_at = excluded.posted_at, closes_at = excluded.closes_at,
      eligibility = excluded.eligibility, is_restricted = excluded.is_restricted,
      source_name = excluded.source_name, source_url = excluded.source_url, fingerprint = excluded.fingerprint,
      last_seen_run_id = p_run_id, last_seen_in_feed_at = now(), consecutive_missing = 0,
      -- Reactivation rules: only when the reason for hiding no longer applies.
      status = case
        when excluded.status = 'not_relevant' then 'not_relevant'
        when t.status = 'not_relevant' then 'active'
        when t.status = 'removed_at_source' then 'active'
        when t.status = 'expired' and (excluded.closes_at is null or excluded.closes_at > now())
             and t.status_reason <> 'stale_no_closing_date' then 'active'
        when t.status = 'expired' and t.status_reason = 'stale_no_closing_date' then 'active'
        when t.status = 'link_unavailable' and excluded.apply_url is distinct from t.apply_url then 'active'
        else t.status end,
      status_reason = case
        when excluded.status = 'not_relevant' then 'title_not_education'
        when t.status in ('removed_at_source','not_relevant') then 'reappeared_in_feed'
        when t.status = 'expired' and (excluded.closes_at is null or excluded.closes_at > now()) then 'reappeared_in_feed'
        when t.status = 'link_unavailable' and excluded.apply_url is distinct from t.apply_url then 'apply_link_changed'
        else t.status_reason end,
      consecutive_link_failures = case when excluded.apply_url is distinct from t.apply_url then 0 else t.consecutive_link_failures end,
      link_failure_since = case when excluded.apply_url is distinct from t.apply_url then null else t.link_failure_since end;
    v_accepted := v_accepted + 1;
  end loop;

  update job_source_runs set fetched = fetched + v_accepted, rejected = rejected + v_rejected where id = p_run_id;
  return jsonb_build_object('accepted', v_accepted, 'rejected', v_rejected);
end $$;

-- Close a run. Applies the "missing from 2 complete runs" rule unless the outage
-- guard blocks it. Returns a summary including any alerts raised.
-- p_accept_drop: set true ONLY by a person who has checked that a big drop is
-- real (e.g. the provider changed its results); never by the scheduler.
create or replace function finish_source_run(p_run_id bigint, p_complete boolean, p_error text default null,
                                             p_accept_drop boolean default false)
returns jsonb language plpgsql as $$
declare
  r job_source_runs%rowtype;
  v_prev int;
  v_guard text;
  v_missing int := 0;
  v_removed int := 0;
  v_drop numeric;
begin
  select * into r from job_source_runs where id = p_run_id for update;
  if r.id is null or r.finished_at is not null then raise exception 'run % is not open', p_run_id; end if;
  perform pg_advisory_xact_lock(hashtext('job_run:' || r.source || ':' || r.scope));

  -- Baseline = the last run whose removals were applied. A run that tripped the
  -- guard never becomes the baseline, so two short (partial) runs in a row
  -- cannot remove anything.
  select fetched into v_prev from job_source_runs
   where source = r.source and scope = r.scope and removals_applied and id <> r.id
   order by started_at desc limit 1;

  if not p_complete then v_guard := 'incomplete_run';
  elsif r.fetched = 0 then v_guard := 'empty_run';
  elsif v_prev is not null and r.fetched < v_prev * 0.5 and not p_accept_drop then
    v_guard := 'count_dropped_' || round(100 - 100.0 * r.fetched / v_prev) || 'pct';
  end if;

  if v_prev is not null and v_prev > 0 then v_drop := 100 - 100.0 * r.fetched / v_prev; end if;

  if v_guard is null then
    with missing as (
      update jobs set consecutive_missing = consecutive_missing + 1
       where source = r.source and (r.scope = '*' or country = r.scope)
         and status in ('active','uncertain')
         and last_seen_run_id is distinct from r.id
      returning id)
    select count(*) into v_missing from missing;

    with removed as (
      update jobs set status = 'removed_at_source', status_reason = 'missing_from_2_complete_runs'
       where source = r.source and (r.scope = '*' or country = r.scope)
         and status in ('active','uncertain') and consecutive_missing >= 2
      returning id)
    select count(*) into v_removed from removed;
  end if;

  update job_source_runs
     set finished_at = now(), complete = p_complete, previous_fetched = v_prev,
         removals_applied = (v_guard is null), guard_reason = v_guard, error = p_error
   where id = r.id;

  if not p_complete then
    insert into job_alerts (kind, source, scope, detail)
    values ('run_failed', r.source, r.scope, jsonb_build_object('run_id', r.id, 'error', p_error, 'fetched', r.fetched));
  end if;
  if v_drop is not null and v_drop > 30 then
    insert into job_alerts (kind, source, scope, detail)
    values ('count_drop', r.source, r.scope, jsonb_build_object('run_id', r.id, 'previous', v_prev,
            'fetched', r.fetched, 'drop_pct', round(v_drop), 'removals_paused', v_guard is not null));
  end if;

  return jsonb_build_object('run_id', r.id, 'fetched', r.fetched, 'previous', v_prev, 'guard', v_guard,
                            'missing_marked', v_missing, 'removed', v_removed);
end $$;

-- 5. Expiry (hourly) ----------------------------------------------------------------------------
create or replace function expire_jobs() returns jsonb language plpgsql as $$
declare v_closed int; v_stale int; v_active int; v_hidden_today int;
begin
  with x as (
    update jobs set status = 'expired', status_reason = 'closing_date_passed'
     where status in ('active','uncertain') and closes_at is not null and closes_at < now()
    returning id) select count(*) into v_closed from x;

  with x as (
    update jobs set status = 'expired', status_reason = 'stale_no_closing_date'
     where status in ('active','uncertain') and closes_at is null
       and posted_at < now() - interval '60 days'
       and (last_seen_in_feed_at is null or last_seen_in_feed_at < now() - interval '7 days')
    returning id) select count(*) into v_stale from x;

  select count(*) into v_active from jobs where status in ('active','uncertain');
  select count(*) into v_hidden_today from job_status_events
   where created_at > now() - interval '1 day'
     and from_status in ('active','uncertain') and to_status not in ('active','uncertain','duplicate');
  if v_hidden_today > 50 or v_hidden_today > 0.10 * greatest(v_active + v_hidden_today, 1) then
    if not exists (select 1 from job_alerts where kind = 'mass_hide' and created_at > now() - interval '1 day') then
      insert into job_alerts (kind, detail) values ('mass_hide',
        jsonb_build_object('hidden_last_24h', v_hidden_today, 'active_now', v_active));
    end if;
  end if;
  return jsonb_build_object('closing_date_passed', v_closed, 'stale', v_stale);
end $$;

-- 6. Verification -------------------------------------------------------------------------------
-- Claim a batch of jobs to check. SKIP LOCKED + a 10-minute lease means two
-- verification workers never check the same job at the same time.
-- p_sources: only sources whose provider allows the check (never 'adzuna').
create or replace function claim_jobs_for_check(p_limit int, p_sources text[])
returns table (id uuid, source text, external_id text, apply_url text, country text)
language plpgsql as $$
begin
  return query
  with c as (
    select j.id from jobs j
     where j.status in ('active','uncertain')
       and j.source = any (p_sources) and j.source <> 'adzuna'
       and coalesce(j.next_check_at, '-infinity') <= now()
       and coalesce(j.check_lock_until, '-infinity') < now()
     order by j.next_check_at nulls first, j.id
     limit p_limit
     for update skip locked)
  update jobs j set check_lock_until = now() + interval '10 minutes'
    from c where j.id = c.id
  returning j.id, j.source, j.external_id, j.apply_url, j.country;
end $$;

-- Record one check and apply the rules. Returns the job's status afterwards.
--   confirmed_open : the source states it is accepting applications
--   listed         : the source still lists it (NOT proof that it is open)
--   gone           : the source's official API says it is removed/expired (detail.filled=true → filled)
--   not_found      : apply link returned 404/410
--   transient      : 5xx, timeout, network error, 429 rate limit — never hides a job
--   blocked        : 403 / robots.txt disallow — stop link-checking it, never hides
--   unsupported    : the provider does not allow this kind of check
create or replace function record_check(p_job_id uuid, p_kind text, p_outcome text,
                                        p_http_status int default null, p_detail jsonb default null)
returns text language plpgsql as $$
declare j jobs%rowtype; v_backoff interval;
begin
  select * into j from jobs where id = p_job_id for update;
  if j.id is null then raise exception 'job % not found', p_job_id; end if;
  if p_kind = 'link' and j.source = 'adzuna' then
    raise exception 'automated link checks are not allowed for Adzuna listings';
  end if;
  if p_outcome = 'gone' and p_kind <> 'source_api' then
    raise exception 'only an official source API can confirm a job is gone';
  end if;

  insert into job_checks (job_id, kind, outcome, http_status, detail)
  values (p_job_id, p_kind, p_outcome, p_http_status, p_detail);

  -- A job already hidden for another reason is only recorded, never re-shown here.
  if j.status not in ('active','uncertain') then
    update jobs set last_checked_at = now(), check_lock_until = null where id = p_job_id;
    return j.status;
  end if;

  if p_outcome in ('confirmed_open','listed') then
    update jobs set last_checked_at = now(),
                    last_confirmed_open_at = case when p_outcome = 'confirmed_open' then now() else last_confirmed_open_at end,
                    consecutive_transient = 0,
                    consecutive_link_failures = case when p_kind = 'link' then 0 else consecutive_link_failures end,
                    link_failure_since = case when p_kind = 'link' then null else link_failure_since end,
                    status = 'active',
                    status_reason = case when status = 'uncertain' then 'check_succeeded' else status_reason end,
                    next_check_at = now() + interval '24 hours', check_lock_until = null
     where id = p_job_id;

  elsif p_outcome = 'gone' then
    update jobs set last_checked_at = now(),
                    status = case when coalesce((p_detail->>'filled')::boolean, false) then 'filled' else 'removed_at_source' end,
                    status_reason = 'source_api_' || coalesce(p_detail->>'reason', 'gone'),
                    check_lock_until = null
     where id = p_job_id;

  elsif p_outcome = 'not_found' then
    if j.link_failure_since is null then
      update jobs set last_checked_at = now(), link_failure_since = now(), consecutive_link_failures = 1,
                      next_check_at = now() + interval '12 hours', check_lock_until = null
       where id = p_job_id;
    elsif now() - j.link_failure_since >= interval '12 hours' then
      update jobs set last_checked_at = now(), consecutive_link_failures = consecutive_link_failures + 1,
                      status = 'link_unavailable', status_reason = 'apply_link_not_found_twice_12h_apart',
                      check_lock_until = null
       where id = p_job_id;
    else
      -- second "not found" too soon: wait until 12 hours have passed
      update jobs set last_checked_at = now(),
                      next_check_at = j.link_failure_since + interval '12 hours', check_lock_until = null
       where id = p_job_id;
    end if;

  elsif p_outcome = 'transient' then
    v_backoff := case least(j.consecutive_transient, 3) when 0 then interval '1 hour'
                   when 1 then interval '6 hours' else interval '24 hours' end;
    update jobs set last_checked_at = now(), consecutive_transient = consecutive_transient + 1,
                    status = case when consecutive_transient + 1 >= 3 then 'uncertain' else status end,
                    status_reason = case when consecutive_transient + 1 >= 3 then 'checks_inconclusive' else status_reason end,
                    next_check_at = now() + v_backoff, check_lock_until = null
     where id = p_job_id;

  else -- blocked / unsupported
    update jobs set last_checked_at = now(),
                    next_check_at = now() + case when p_outcome = 'blocked' then interval '7 days' else interval '24 hours' end,
                    check_lock_until = null
     where id = p_job_id;
  end if;

  return (select status from jobs where id = p_job_id);
end $$;

-- 7. Duplicates ---------------------------------------------------------------------------------
create or replace function job_source_rank(p_source text) returns int language sql immutable as $$
  select case p_source
    when 'teaching_vacancies' then 1 when 'usajobs' then 1 when 'employer' then 1
    when 'reed' then 2 when 'adzuna' then 3 else 4 end
$$;

create or replace function mark_duplicates() returns jsonb language plpgsql as $$
declare v_released int; v_marked int;
begin
  -- Release duplicates whose preferred copy is no longer visible.
  with x as (
    update jobs d set status = 'active', status_reason = 'preferred_copy_gone', duplicate_of = null
      from jobs p
     where d.status = 'duplicate' and d.duplicate_of = p.id and p.status not in ('active','uncertain')
    returning d.id) select count(*) into v_released from x;

  with ranked as (
    select id, first_value(id) over w as keep_id, row_number() over w as rn
      from jobs
     where fingerprint is not null and status in ('active','uncertain','duplicate')
    window w as (partition by fingerprint
                 order by job_source_rank(source), (closes_at is not null) desc,
                          (coalesce(salary_min, salary_max) is not null and not salary_is_predicted) desc,
                          posted_at desc nulls last, id)),
  x as (
    update jobs j set status = 'duplicate', status_reason = 'duplicate_of_preferred_copy', duplicate_of = r.keep_id
      from ranked r
     where j.id = r.id and r.rn > 1 and (j.status <> 'duplicate' or j.duplicate_of is distinct from r.keep_id)
    returning j.id) select count(*) into v_marked from x;

  -- the preferred copy itself must be visible
  update jobs j set status = 'active', status_reason = 'preferred_copy', duplicate_of = null
    from (select distinct first_value(id) over (partition by fingerprint
            order by job_source_rank(source), (closes_at is not null) desc,
                     (coalesce(salary_min, salary_max) is not null and not salary_is_predicted) desc,
                     posted_at desc nulls last, id) as keep_id
            from jobs where fingerprint is not null and status in ('active','uncertain','duplicate')) k
   where j.id = k.keep_id and j.status = 'duplicate';

  return jsonb_build_object('marked', v_marked, 'released', v_released);
end $$;

-- 8. Visitor reports ---------------------------------------------------------------------------
-- Called by the site's API route (service role). Max 20 reports per job per day;
-- a report brings the job's next check forward. It never hides a job by itself.
create or replace function report_job(p_job_id uuid, p_reason text, p_note text default null)
returns text language plpgsql as $$
begin
  if not exists (select 1 from jobs where id = p_job_id and status in ('active','uncertain')) then
    return 'not_visible';
  end if;
  if (select count(*) from job_reports where job_id = p_job_id and created_at > now() - interval '1 day') >= 20 then
    return 'limit_reached';
  end if;
  insert into job_reports (job_id, reason, note) values (p_job_id, p_reason, left(p_note, 500));
  update jobs set next_check_at = now() where id = p_job_id;
  if (select count(*) from job_reports r join jobs j on j.id = r.job_id
       where r.created_at > now() - interval '1 day'
         and j.source = (select source from jobs where id = p_job_id)) > 5
     and not exists (select 1 from job_alerts where kind = 'report_spike' and created_at > now() - interval '1 day') then
    insert into job_alerts (kind, source, detail)
    values ('report_spike', (select source from jobs where id = p_job_id), jsonb_build_object('job_id', p_job_id));
  end if;
  return 'recorded';
end $$;

-- 9. Access ------------------------------------------------------------------------------------
alter table job_source_runs   enable row level security;  -- no policies: service role only
alter table job_checks        enable row level security;
alter table job_status_events enable row level security;
alter table job_alerts        enable row level security;
alter table job_reports       enable row level security;

-- Supabase grants EXECUTE on new functions to anon and authenticated by
-- default, so revoking from PUBLIC alone is not enough.
revoke execute on function begin_source_run(text, text), upsert_feed_jobs(bigint, jsonb),
  finish_source_run(bigint, boolean, text, boolean), expire_jobs(), claim_jobs_for_check(int, text[]),
  record_check(uuid, text, text, int, jsonb), mark_duplicates(), report_job(uuid, text, text)
  from public, anon, authenticated;

drop policy if exists "Public can read active jobs" on jobs;
create policy "Public can read active jobs"
  on jobs for select
  using (status in ('active','uncertain') and (closes_at is null or closes_at > now()));

commit;

-- 10. Schedules — ONLY after separate approval, and on staging first --------------------------
-- select cron.schedule('jobs-expire',  '7 * * * *',  $$ select expire_jobs(); select mark_duplicates(); $$);
-- select cron.schedule('jobs-verify',  '17 * * * *', $$ select net.http_post(url := '<project>/functions/v1/verify-jobs', ...) $$);
-- select cron.schedule('jobs-import',  '0 3 * * *',  $$ select net.http_post(url := '<project>/functions/v1/ingest-jobs', ...) $$);

-- 11. Roll back (before go-live) ---------------------------------------------------------------
-- begin;
--   drop policy if exists "Public can read active jobs" on jobs;
--   create policy "Public can read active jobs" on jobs for select using (is_active = true);
--   drop trigger if exists jobs_log_status_change on jobs; drop trigger if exists jobs_status_bookkeeping on jobs;
--   drop function if exists jobs_log_status_change(), jobs_status_bookkeeping(), begin_source_run(text,text),
--     upsert_feed_jobs(bigint,jsonb), finish_source_run(bigint,boolean,text,boolean), expire_jobs(),
--     claim_jobs_for_check(int,text[]), record_check(uuid,text,text,int,jsonb), mark_duplicates(),
--     job_source_rank(text), report_job(uuid,text,text);
--   drop table if exists job_reports, job_alerts, job_status_events, job_checks, job_source_runs;
--   alter table jobs drop constraint if exists jobs_status_check;
--   -- the added columns can stay (harmless) or be dropped individually
-- commit;
