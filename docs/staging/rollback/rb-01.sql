-- STAGING ONLY rollback for step 01 on wta-staging (fvhbwckoesjxiiktwkfy). Needs separate approval.
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
-- Full staging teardown of the job tables. Steps 05 and 06 roll back by
-- switching features off and KEEPING their tables (as production would);
-- on staging those kept tables are removed here, before jobs and leads.
drop table if exists public.portal_sessions, public.marketing_suppressions,
  public.job_reports, public.job_checks, public.job_status_events,
  public.job_alerts, public.job_source_runs;
drop table if exists public.leads;
drop table if exists public.jobs;
