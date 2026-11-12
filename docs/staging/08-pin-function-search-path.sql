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
-- Step 08 (proposed, NOT applied): pin search_path on the 15 public functions
-- flagged by Supabase's security advisor (0011 function_search_path_mutable).
-- All 15 are SECURITY INVOKER, so they already run with the caller's own rights;
-- pinning search_path stops a caller from redirecting their unqualified table and
-- function names to objects in another schema. pg_catalog comes first so built-in
-- functions can't be shadowed; pg_temp comes last so temporary objects can't be.
-- No data is read or changed. Function bodies are unchanged.
alter function public.apply_visitor_retention(integer, integer, integer, integer) set search_path = pg_catalog, public, pg_temp;
alter function public.begin_source_run(text, text) set search_path = pg_catalog, public, pg_temp;
alter function public.claim_jobs_for_check(integer, text[]) set search_path = pg_catalog, public, pg_temp;
alter function public.erase_visitor(text) set search_path = pg_catalog, public, pg_temp;
alter function public.expire_jobs() set search_path = pg_catalog, public, pg_temp;
alter function public.export_visitor_data(text) set search_path = pg_catalog, public, pg_temp;
alter function public.finish_source_run(bigint, boolean, text, boolean, boolean, timestamp with time zone) set search_path = pg_catalog, public, pg_temp;
alter function public.job_source_rank(text) set search_path = pg_catalog, public, pg_temp;
alter function public.jobs_log_status_change() set search_path = pg_catalog, public, pg_temp;
alter function public.jobs_status_bookkeeping() set search_path = pg_catalog, public, pg_temp;
alter function public.mark_duplicates() set search_path = pg_catalog, public, pg_temp;
alter function public.record_check(uuid, text, text, integer, jsonb) set search_path = pg_catalog, public, pg_temp;
alter function public.report_job(uuid, text, text) set search_path = pg_catalog, public, pg_temp;
alter function public.revoke_portal_access(text, text) set search_path = pg_catalog, public, pg_temp;
alter function public.upsert_feed_jobs(bigint, jsonb) set search_path = pg_catalog, public, pg_temp;
