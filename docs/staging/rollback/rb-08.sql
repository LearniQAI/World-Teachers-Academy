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
-- Rollback for step 08: return the 15 functions to the default (unpinned) search_path.
alter function public.apply_visitor_retention(integer, integer, integer, integer) reset search_path;
alter function public.begin_source_run(text, text) reset search_path;
alter function public.claim_jobs_for_check(integer, text[]) reset search_path;
alter function public.erase_visitor(text) reset search_path;
alter function public.expire_jobs() reset search_path;
alter function public.export_visitor_data(text) reset search_path;
alter function public.finish_source_run(bigint, boolean, text, boolean, boolean, timestamp with time zone) reset search_path;
alter function public.job_source_rank(text) reset search_path;
alter function public.jobs_log_status_change() reset search_path;
alter function public.jobs_status_bookkeeping() reset search_path;
alter function public.mark_duplicates() reset search_path;
alter function public.record_check(uuid, text, text, integer, jsonb) reset search_path;
alter function public.report_job(uuid, text, text) reset search_path;
alter function public.revoke_portal_access(text, text) reset search_path;
alter function public.upsert_feed_jobs(bigint, jsonb) reset search_path;
