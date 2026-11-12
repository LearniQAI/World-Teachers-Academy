#!/usr/bin/env bash
# Concurrency scenarios: several real sessions at once against the local test DB.
set -euo pipefail
PSQL="$1"
q() { $PSQL -At -c "$1"; }
q "create table if not exists claims (worker text, id uuid);
   select run_import('teaching_vacancies','GB', tjs('tvc', 1, 200));
   update jobs set next_check_at = now() - interval '1 minute', check_lock_until = null where source='teaching_vacancies';" >/dev/null

echo '== Two verification workers at the same time'
for w in A B C; do
  $PSQL -c "begin; insert into claims select '$w', id from claim_jobs_for_check(80, array['teaching_vacancies']); select pg_sleep(1); commit;" >/dev/null &
done
wait
q "select ok((select count(*) from claims) = (select count(distinct id) from claims), 'no job claimed by two workers');
   select ok((select count(*) from claims) = 200, 'three workers claimed all 200 between them, once each');" >/dev/null

echo '== Import and verification running together'
q "update jobs set check_lock_until = null, next_check_at = now() - interval '1 minute' where source='teaching_vacancies';" >/dev/null
$PSQL -c "select run_import('teaching_vacancies','GB', tjs('tvc', 1, 200)); select pg_sleep(0.5);
          select run_import('teaching_vacancies','GB', tjs('tvc', 1, 190)); select run_import('teaching_vacancies','GB', tjs('tvc', 1, 190));" >/dev/null &
IMP=$!
$PSQL -c "do \$\$ declare r record; n int := 0; begin
  for r in select * from claim_jobs_for_check(200, array['teaching_vacancies']) loop
    perform record_check(r.id, 'source_api', case when n % 3 = 0 then 'transient' else 'listed' end, case when n % 3 = 0 then 429 else 200 end);
    n := n + 1;
  end loop; end \$\$;" >/dev/null &
VER=$!
wait $IMP; wait $VER
q "select ok((select count(*) from jobs where source='teaching_vacancies' and external_id like 'tvc%' and status in ('active','uncertain')) = 190,
            'concurrent run: 190 shown, the 10 missing twice removed, none lost to rate-limit results');
   select ok((select count(*) from jobs where source='teaching_vacancies' and external_id like 'tvc%' and status='removed_at_source') = 10, '10 removed');" >/dev/null

echo '== Two imports for the same feed started at once'
for w in 1 2; do
  $PSQL -At -c "insert into claims select 'run$w', null where begin_source_run('reed','ZZ') is null;" >/dev/null &
done
wait
q "select ok((select count(*) from claims where worker like 'run%') = 1, 'only one of two simultaneous imports starts');
   update job_source_runs set finished_at = now(), complete = false where scope='ZZ';" >/dev/null
