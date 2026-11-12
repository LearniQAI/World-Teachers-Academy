-- End-to-end: recorded Teaching Vacancies page → normaliser → database rules.
\set ON_ERROR_STOP 1
set client_min_messages = warning;
\set tv `node --experimental-strip-types --no-warnings tv-fixture-to-json.ts`
\echo '== Teaching Vacancies import (recorded response)'
select ok((run_import('teaching_vacancies','GB', :'tv'::jsonb)->>'fetched')::int = 20, 'TV: 20 recorded jobs imported');
select ok((select count(*) from jobs where source='teaching_vacancies' and external_id like 'https://teaching-vacancies%' and status='active') = 11, 'TV: 11 education roles shown');
select ok((select count(*) from jobs where source='teaching_vacancies' and external_id like 'https://teaching-vacancies%' and status='not_relevant') = 9, 'TV: 9 admin/catering/site/business roles stored but hidden');
select ok((select salary_text from jobs where title='Cover Supervisor' and source='teaching_vacancies') = '£20,225.00 - £22,249.00 Annually (Actual)', 'TV: salary wording stored verbatim');
select ok((select count(*) from jobs where source='teaching_vacancies' and external_id like 'https://teaching-vacancies%' and closes_at is null) = 0, 'TV: every job has its closing date');
-- the Coritani teacher closes 16 Nov 2026; move it into the past
update jobs set closes_at = now() - interval '1 hour' where title like 'Teacher - Coritani%';
select expire_jobs();
select ok((select status from jobs where title like 'Teacher - Coritani%') = 'expired', 'TV: job hidden once its closing date passes');
-- the same vacancy also arrives via Adzuna
select run_import('adzuna','GB', tjs('gb', 1, 100) || jsonb_build_array(
  tj('adz-tv','GB', jsonb_build_object('title','Cover Supervisor','company_name','Reading Girls'' School','city','Reading, Berkshire',
     'fingerprint', (select fingerprint from jobs where source='teaching_vacancies' and title='Cover Supervisor')))));
select mark_duplicates();
select ok(st('adzuna','adz-tv') = 'duplicate', 'TV: Adzuna copy of a TV vacancy hidden as duplicate');
-- next day the feed no longer lists the Exam Invigilator; two complete, exhaustive runs later it is removed
select run_import('teaching_vacancies','GB', (select jsonb_agg(e) from jsonb_array_elements(:'tv'::jsonb) e where e->>'title' <> 'Exam Invigilator'));
select ok((select status from jobs where title='Exam Invigilator' and source='teaching_vacancies') = 'active', 'TV: missing once — still shown');
select run_import('teaching_vacancies','GB', (select jsonb_agg(e) from jsonb_array_elements(:'tv'::jsonb) e where e->>'title' <> 'Exam Invigilator'));
select ok((select status from jobs where title='Exam Invigilator' and source='teaching_vacancies') = 'removed_at_source', 'TV: missing twice — hidden, kept in history');
