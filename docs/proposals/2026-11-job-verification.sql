-- =============================================================================
-- PROPOSAL ONLY — NOT A MIGRATION. DO NOT APPLY WITHOUT THE OWNER'S APPROVAL.
-- Kept outside supabase/migrations on purpose, so `supabase db push` and
-- branch deploys cannot pick it up.
--
-- Target: WTA Supabase project "WorldTeachersAcademy" (nxwmtcsezswjrignajdm),
-- which is PRODUCTION. Test first on a separate, empty project or a local
-- Supabase stack (see the Phase A design doc).
--
-- Purpose: job verification and expiry with an audit trail.
--   * nothing is deleted — jobs change status, and every change is logged;
--   * `is_active` stays and is kept in step during the switch-over, so the
--     current site and import keep working unchanged;
--   * all new tables are closed to the public (RLS on, no public policies).
-- =============================================================================

begin;

-- 1. Status and verification columns on jobs ---------------------------------
alter table jobs
  add column if not exists status text not null default 'active',
  add column if not exists status_reason text,
  add column if not exists status_changed_at timestamptz,
  -- dates from the source
  add column if not exists closes_at timestamptz,            -- application deadline, when the source gives one
  -- verification bookkeeping
  add column if not exists first_seen_at timestamptz default now(),
  add column if not exists last_seen_in_feed_at timestamptz, -- last complete feed pull that contained the job
  add column if not exists last_verified_at timestamptz,     -- last check that CONFIRMED it open
  add column if not exists last_checked_at timestamptz,      -- last check of any outcome
  add column if not exists consecutive_missing int not null default 0,       -- complete pulls in a row without it
  add column if not exists consecutive_link_failures int not null default 0, -- confirmed "not found" link results in a row
  add column if not exists next_check_at timestamptz,
  -- what visitors should know
  add column if not exists eligibility text,                 -- e.g. "US citizens only" (USAJOBS WhoMayApply), shown verbatim
  add column if not exists salary_period text,               -- 'year' | 'month' | 'day' | 'hour' | null when the source doesn't say
  add column if not exists source_name text,                 -- visitor-facing source label, e.g. "Teaching Vacancies (GOV.UK)"
  add column if not exists source_url text,                  -- the listing on the source site
  -- duplicates
  add column if not exists fingerprint text,
  add column if not exists duplicate_of uuid references jobs(id);

alter table jobs drop constraint if exists jobs_status_check;
alter table jobs add constraint jobs_status_check check (status in (
  'active',            -- shown
  'uncertain',         -- shown; a check could not get a clear answer, retrying
  'expired',           -- hidden; closing date passed, or stale with no closing date
  'removed_at_source', -- hidden; missing from 2+ complete feed pulls, or the source says it is gone
  'link_unavailable',  -- hidden; apply link "not found" twice, 12h+ apart
  'filled',            -- hidden; source states it is filled/closed
  'duplicate',         -- hidden; another row is the preferred copy (duplicate_of)
  'not_relevant'       -- hidden; not an education role (title rule)
));

-- Back-fill from today's flag, so nothing changes for visitors on day one.
update jobs set status = case when is_active then 'active' else 'removed_at_source' end,
                status_reason = case when is_active then null else 'legacy_inactive' end,
                status_changed_at = coalesce(status_changed_at, updated_at),
                last_seen_in_feed_at = coalesce(last_seen_in_feed_at, case when is_active then updated_at end)
 where status_changed_at is null;

create index if not exists jobs_status_idx       on jobs (status);
create index if not exists jobs_next_check_idx   on jobs (next_check_at) where status in ('active','uncertain');
create index if not exists jobs_closes_at_idx    on jobs (closes_at) where status in ('active','uncertain');
create index if not exists jobs_fingerprint_idx  on jobs (fingerprint);

-- Keep the legacy flag in step (one source of truth: status).
-- NOTE: from here on `status` decides visibility. The import must be updated
-- in the same release to set status = 'active' when a job reappears in its
-- feed (today it only sets is_active = true, which this trigger overrides).
create or replace function jobs_sync_is_active() returns trigger language plpgsql as $$
begin
  new.is_active := new.status in ('active','uncertain');
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end $$;
drop trigger if exists jobs_sync_is_active on jobs;
create trigger jobs_sync_is_active before update on jobs
  for each row execute function jobs_sync_is_active();

-- 2. Audit log: every status change, with evidence -----------------------------
create table if not exists job_status_events (
  id bigint generated always as identity primary key,
  job_id uuid not null references jobs(id),
  from_status text,
  to_status text not null,
  reason text not null,          -- e.g. 'closing_date_passed', 'missing_from_feed_x2', 'link_404_x2'
  evidence jsonb,                -- e.g. {"http_status":404,"url":"…","checked_at":"…"} or {"run_ids":[…]}
  actor text not null default 'system', -- 'system' | 'admin:<email>'
  created_at timestamptz not null default now()
);
create index if not exists job_status_events_job_idx on job_status_events (job_id, created_at desc);

create or replace function jobs_log_status_change() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    insert into job_status_events (job_id, from_status, to_status, reason, evidence)
    values (new.id, old.status, new.status, coalesce(new.status_reason, 'unspecified'),
            jsonb_build_object('changed_at', now()));
  end if;
  return new;
end $$;
drop trigger if exists jobs_log_status_change on jobs;
create trigger jobs_log_status_change after update on jobs
  for each row execute function jobs_log_status_change();

-- 3. Feed runs: the basis of outage protection and alerts ---------------------
create table if not exists job_source_runs (
  id bigint generated always as identity primary key,
  source text not null,          -- 'adzuna' | 'reed' | 'teaching_vacancies' | 'usajobs' …
  scope text not null,           -- e.g. country code or 'all'
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  complete boolean not null default false, -- true only when every page was fetched without error
  fetched int not null default 0,
  previous_fetched int,          -- fetched count of the last complete run for this source/scope
  removals_applied boolean not null default false, -- false when the outage guard blocked removals
  guard_reason text,             -- why removals were blocked, e.g. 'count_dropped_62pct'
  error text
);
create index if not exists job_source_runs_idx on job_source_runs (source, scope, started_at desc);

-- 4. Visitor reports ("Report an unavailable job") -----------------------------
create table if not exists job_reports (
  id bigint generated always as identity primary key,
  job_id uuid not null references jobs(id),
  reason text not null check (reason in ('link_broken','job_closed','wrong_details','not_a_teaching_job','other')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  outcome text                   -- what verification found
);
-- No personal data is stored: no name, e-mail or IP address.

-- 5. Access ----------------------------------------------------------------------
alter table job_status_events enable row level security; -- no policies: service role only
alter table job_source_runs   enable row level security; -- no policies: service role only
alter table job_reports       enable row level security; -- inserts go through the API route with the service role

-- Public read policy now follows status (replaces "is_active = true").
drop policy if exists "Public can read active jobs" on jobs;
create policy "Public can read active jobs"
  on jobs for select
  using (status in ('active','uncertain'));

commit;

-- 6. Hourly expiry rule (scheduled ONLY after separate approval) ---------------
-- update jobs
--    set status = 'expired', status_reason = 'closing_date_passed'
--  where status in ('active','uncertain') and closes_at is not null and closes_at < now();
--
-- select cron.schedule('jobs-expire-hourly', '7 * * * *', $$ … the update above … $$);
-- select cron.schedule('jobs-verify-hourly', '17 * * * *', $$ select net.http_post(… /functions/v1/verify-jobs …) $$);

-- 7. Roll back (if needed before go-live) ---------------------------------------
-- begin;
--   drop trigger if exists jobs_log_status_change on jobs;
--   drop trigger if exists jobs_sync_is_active on jobs;
--   drop function if exists jobs_log_status_change(); drop function if exists jobs_sync_is_active();
--   drop policy if exists "Public can read active jobs" on jobs;
--   create policy "Public can read active jobs" on jobs for select using (is_active = true);
--   drop table if exists job_reports; drop table if exists job_source_runs; drop table if exists job_status_events;
--   alter table jobs drop constraint if exists jobs_status_check;
--   alter table jobs drop column if exists status, … ;
-- commit;
