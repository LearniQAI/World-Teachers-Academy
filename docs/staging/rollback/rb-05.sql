-- STAGING ONLY rollback for step 05 on wta-staging (fvhbwckoesjxiiktwkfy). Needs separate approval.
-- ===== STAGING GUARD (added for wta-staging; not part of the original file) =====
do $$
begin
  if to_regclass('wta_meta.environment') is null then
    raise exception 'STOP: this database is not wta-staging (fvhbwckoesjxiiktwkfy). Nothing was applied.';
  end if;
  if not exists (select 1 from wta_meta.environment where project_ref = 'fvhbwckoesjxiiktwkfy' and label = 'staging') then
    raise exception 'STOP: this database is not wta-staging (fvhbwckoesjxiiktwkfy). Nothing was applied.';
  end if;
end $$;
-- =============================================================================
-- PROPOSAL ONLY. Rollback for docs/proposals/2026-11-job-verification.sql.
-- Run only with the owner's approval, on the project named in the request.
--
-- "Switch off" rollback: the site goes back to the original is_active rule and
-- the v1 import (ingest-jobs) keeps working unchanged. NOTHING IS DELETED:
--   * every job row stays, with its current visibility (is_active);
--   * the audit tables (job_status_events, job_checks, job_source_runs,
--     job_alerts, job_reports) and the added columns stay, read-only history;
--   * only the policy, triggers and functions are removed.
-- Re-applying the proposal later is safe (it uses IF NOT EXISTS / OR REPLACE).
-- Tested in tests/db/rollback.test.sql.
-- =============================================================================

-- 1. Public visibility back to the original rule.
drop policy if exists "Public can read active jobs" on jobs;
create policy "Public can read active jobs" on jobs for select using (is_active = true);

-- 2. Stop the automatic status bookkeeping (v1 writes is_active directly).
drop trigger if exists jobs_status_bookkeeping on jobs;
drop trigger if exists jobs_log_status_change on jobs;

-- 3. Remove the functions (they hold no data).
drop function if exists
  begin_source_run(text, text),
  upsert_feed_jobs(bigint, jsonb),
  finish_source_run(bigint, boolean, text, boolean, boolean, timestamptz),
  expire_jobs(),
  claim_jobs_for_check(int, text[]),
  record_check(uuid, text, text, int, jsonb),
  mark_duplicates(),
  job_source_rank(text),
  report_job(uuid, text, text),
  jobs_status_bookkeeping(),
  jobs_log_status_change();

-- 4. New rows from v1 get the column defaults; relax the one constraint v1
--    could trip (status values are no longer maintained).
alter table jobs drop constraint if exists jobs_status_check;


-- Full removal of the history (tables and columns) is a separate decision:
-- export job_status_events, job_checks, job_source_runs, job_alerts and
-- job_reports first, then drop them. Not scripted on purpose.
