-- Runs after verification.test.sql: applies the rollback and checks nothing was lost.
\set ON_ERROR_STOP 1
set client_min_messages = warning;
create temp table before as
  select (select count(*) from jobs) jobs_n, (select count(*) from jobs where is_active) active_n,
         (select count(*) from job_status_events) events_n, (select count(*) from job_checks) checks_n,
         (select count(*) from job_reports) reports_n;
\i ../../docs/proposals/2026-11-job-verification-rollback.sql
select ok((select jobs_n from before) = (select count(*) from jobs), 'rollback: no job deleted');
select ok((select active_n from before) = (select count(*) from jobs where is_active), 'rollback: visibility unchanged');
select ok((select events_n from before) = (select count(*) from job_status_events), 'rollback: audit log kept');
select ok((select checks_n from before) = (select count(*) from job_checks) and (select reports_n from before) = (select count(*) from job_reports), 'rollback: checks and reports kept');
select ok(not exists (select 1 from pg_proc where proname in ('finish_source_run','record_check','expire_jobs','report_job')), 'rollback: functions removed');
set role anon;
select count(*) as anon_after from jobs \gset
reset role;
select ok(:anon_after = (select count(*) from jobs where is_active), 'rollback: public sees exactly is_active jobs');
-- v1 import still works
insert into jobs (source, external_id, title, country, apply_url, posted_at, is_active)
values ('adzuna','v1-after','Teacher','GB','https://example.test/v1', now(), true)
on conflict (source, external_id) do update set is_active = true;
update jobs set is_active = false where source = 'adzuna' and external_id = 'gb5';
select ok((select is_active from jobs where external_id = 'v1-after') and not (select is_active from jobs where external_id='gb5'), 'rollback: v1 import writes still work');
-- re-applying the proposal afterwards is safe
\i ../../docs/proposals/2026-11-job-verification.sql
select ok(exists (select 1 from pg_proc where proname = 'finish_source_run'), 're-apply after rollback: works');
select ok((select events_n from before) <= (select count(*) from job_status_events), 're-apply: audit log still there');
select ok(st('adzuna','gb5') = 'removed_at_source' and st('adzuna','v1-after') = 'active', 're-apply: changes made by v1 meanwhile are respected');
