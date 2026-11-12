-- STAGING ONLY rollback for step 07 on wta-staging (fvhbwckoesjxiiktwkfy). Needs separate approval.
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
-- Removes only the synthetic rows added by 07 (and anything the tests created from them).
delete from public.job_reports where job_id in (select id from public.jobs where external_id like 'synthetic-%');
delete from public.job_checks where job_id in (select id from public.jobs where external_id like 'synthetic-%');
delete from public.job_status_events where job_id in (select id from public.jobs where external_id like 'synthetic-%');
update public.jobs set duplicate_of = null where duplicate_of in (select id from public.jobs where external_id like 'synthetic-%');
delete from public.jobs where external_id like 'synthetic-%';
delete from public.portal_sessions where lead_id in (select id from public.leads where email like '%@example.com');
delete from public.leads where email like '%@example.com';
