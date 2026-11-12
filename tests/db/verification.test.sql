-- Scenario tests for docs/proposals/2026-11-job-verification.sql.
-- Run with tests/db/run.sh against a throwaway local Postgres — never a Supabase project.
-- Time is simulated by moving stored timestamps backwards.
\set ON_ERROR_STOP 1
set client_min_messages = warning;

\echo '== Back-fill of existing rows'
select ok(st('adzuna','legacy-on') = 'active', 'existing active job stays active');
select ok(st('adzuna','legacy-off') = 'removed_at_source', 'existing inactive job becomes removed_at_source');
select ok((select status_reason from jobs where external_id = 'legacy-off') = 'legacy_inactive', 'legacy reason recorded');
select ok((select is_active from jobs where external_id = 'legacy-on'), 'is_active kept in step');
-- park the legacy rows so they do not affect the counts below
update jobs set source = 'legacy' where external_id like 'legacy-%';

\echo '== Normal import, then a vacancy missing from ONE complete run'
select ok((run_import('adzuna','GB', tjs('gb', 1, 100))->>'guard') is null, 'first complete run applies');
select ok((select count(*) from jobs where source='adzuna' and country='GB' and status='active') = 100, '100 GB jobs active');
select ok((run_import('adzuna','GB', tjs('gb', 1, 99))->>'removed')::int = 0, 'missing once: nothing removed');
select ok(st('adzuna','gb100') = 'active', 'gb100 still shown after one miss');
select ok((select consecutive_missing from jobs where external_id='gb100') = 1, 'gb100 missed once');

\echo '== Feed outage between the two misses'
select ok((run_import('adzuna','GB', '[]'::jsonb, false)->>'guard') = 'incomplete_run', 'failed run: removals paused');
select ok(st('adzuna','gb100') = 'active', 'gb100 not removed by a failed run');
select ok((select count(*) from job_alerts where kind='run_failed' and scope='GB') = 1, 'failed run raises an alert');
select ok((run_import('adzuna','GB', '[]'::jsonb, true)->>'guard') = 'empty_run', 'complete-but-empty run: removals paused');
select ok((select count(*) from jobs where source='adzuna' and country='GB' and status='active') = 100, 'empty run removed nothing');
select ok((select consecutive_missing from jobs where external_id='gb100') = 1, 'guarded runs do not count as misses');

\echo '== Second complete miss removes it (and keeps the record)'
select ok((run_import('adzuna','GB', tjs('gb', 1, 99))->>'removed')::int = 1, 'second complete miss: one removal');
select ok(st('adzuna','gb100') = 'removed_at_source', 'gb100 hidden');
select ok((select status_reason from jobs where external_id='gb100') = 'missing_from_2_complete_runs', 'reason recorded');
select ok(exists (select 1 from job_status_events e join jobs j on j.id=e.job_id
                  where j.external_id='gb100' and e.to_status='removed_at_source'), 'status change in audit log');

\echo '== Disappears and reappears'
select run_import('adzuna','GB', tjs('gb', 1, 100));
select ok(st('adzuna','gb100') = 'active', 'gb100 shown again when it returns');
select ok((select status_reason from jobs where external_id='gb100') = 'reappeared_in_feed', 'reappearance reason');
select ok((select consecutive_missing from jobs where external_id='gb100') = 0, 'miss counter reset');

\echo '== Partial import: suspiciously few results, twice'
select ok((run_import('adzuna','GB', tjs('gb', 1, 40))->>'guard') like 'count_dropped_%', 'run with 40 of 100: paused');
select ok((run_import('adzuna','GB', tjs('gb', 1, 40))->>'guard') like 'count_dropped_%', 'second short run: still paused (baseline not lowered)');
select ok((select count(*) from jobs where source='adzuna' and country='GB' and status='active') = 100, 'two short runs removed nothing');
select ok((select count(*) from job_alerts where kind='count_drop' and scope='GB') >= 2, 'count-drop alerts raised');
-- a person confirms the drop is real; removals still need two complete misses
select ok((run_import('adzuna','GB', tjs('gb', 1, 40), true, true)->>'removed')::int = 0, 'accepted drop: first miss only');
select ok((run_import('adzuna','GB', tjs('gb', 1, 40))->>'removed')::int = 60, 'next normal run removes the 60');
select run_import('adzuna','GB', tjs('gb', 1, 100));  -- restore
select ok((select count(*) from jobs where source='adzuna' and country='GB' and status='active') = 100, 'all 100 back');

\echo '== Overlapping runs'
do $$ declare a bigint; b bigint; begin
  a := begin_source_run('adzuna','GB'); b := begin_source_run('adzuna','GB');
  perform ok(a is not null and b is null, 'second run for same source/country refused while first is open');
  perform finish_source_run(a, false, 'test');
end $$;

\echo '== Incorrect country mapping'
do $$ declare r bigint; res jsonb; begin
  r := begin_source_run('adzuna','GB');
  res := upsert_feed_jobs(r, jsonb_build_array(tj('wrong1','US'), tj('wrong2','UK'), tj('wrong3', null), tj('gb1','GB')));
  perform ok((res->>'rejected')::int = 3 and (res->>'accepted')::int = 1, 'US / UK / missing country refused in a GB run');
  perform finish_source_run(r, false, 'test');
end $$;
select ok(not exists (select 1 from jobs where external_id like 'wrong%'), 'no wrongly mapped rows stored');
do $$ declare r bigint; res jsonb; begin
  r := begin_source_run('usajobs','*');
  res := upsert_feed_jobs(r, jsonb_build_array(tj('us-ok','US'), tj('de-ok','DE'), tj('bad','Germany')));
  perform ok((res->>'rejected')::int = 1, 'multi-country run still refuses non-ISO codes');
  perform finish_source_run(r, false, 'test');
end $$;

\echo '== Closing dates'
select run_import('reed','GB', jsonb_build_array(
  tj('r-past', 'GB', jsonb_build_object('closes_at', (now() - interval '1 hour')::text)),
  tj('r-future', 'GB', jsonb_build_object('closes_at', (now() + interval '10 days')::text)),
  tj('r-none', 'GB'),
  tj('r-stale', 'GB', jsonb_build_object('posted_at', (now() - interval '90 days')::text))));
set role anon;
select count(*) as anon_past from jobs where external_id = 'r-past' \gset
reset role;
select ok(:anon_past = 0, 'job past its closing date is hidden from the public immediately (before the hourly job)');
update jobs set last_seen_in_feed_at = now() - interval '8 days' where external_id = 'r-stale';
select ok((expire_jobs()->>'closing_date_passed')::int = 1, 'expire_jobs: one closing date passed');
select ok(st('reed','r-past') = 'expired' and st('reed','r-future') = 'active', 'only the passed date expires');
select ok(st('reed','r-stale') = 'expired', 'no closing date, 90 days old, not in feed for 8 days: expired');
select ok(st('reed','r-none') = 'active', 'recent job without closing date stays');
-- the employer extends the deadline
select run_import('reed','GB', jsonb_build_array(
  tj('r-past', 'GB', jsonb_build_object('closes_at', (now() + interval '5 days')::text)),
  tj('r-future','GB', jsonb_build_object('closes_at', (now() + interval '10 days')::text)), tj('r-none','GB')));
select ok(st('reed','r-past') = 'active', 'extended closing date: shown again');

\echo '== Link checks: broken links need two "not found" results 12+ hours apart'
select ok(record_check(jid('reed','r-none'), 'link', 'not_found', 404) = 'active', 'first 404: still shown');
select ok(record_check(jid('reed','r-none'), 'link', 'not_found', 404) = 'active', 'second 404 one minute later: still shown');
select ok((select next_check_at >= link_failure_since + interval '12 hours' from jobs where external_id='r-none'), 'next check waits for 12h');
update jobs set link_failure_since = now() - interval '13 hours' where external_id = 'r-none';
select ok(record_check(jid('reed','r-none'), 'link', 'not_found', 410) = 'link_unavailable', '404 again after 13h: hidden');
select ok((select count(*) from job_checks c join jobs j on j.id=c.job_id where j.external_id='r-none') = 3, 'every check kept as evidence');
-- a 404 followed by a success resets the streak
select record_check(jid('reed','r-future'), 'link', 'not_found', 404);
select record_check(jid('reed','r-future'), 'link', 'listed', 200);
select ok((select link_failure_since from jobs where external_id='r-future') is null, 'success clears the failure streak');
-- link_unavailable job gets a new apply link in the feed → shown again
select run_import('reed','GB', jsonb_build_array(
  tj('r-none','GB', jsonb_build_object('apply_url','https://example.test/new-link')),
  tj('r-past','GB', jsonb_build_object('closes_at', (now() + interval '5 days')::text)),
  tj('r-future','GB', jsonb_build_object('closes_at', (now() + interval '10 days')::text))));
select ok(st('reed','r-none') = 'active', 'new apply link: shown again');

\echo '== Provider rules'
do $$ begin
  begin perform record_check(jid('adzuna','gb1'), 'link', 'not_found', 404);
        perform ok(false, 'adzuna link check must be refused');
  exception when others then perform ok(sqlerrm like '%not allowed for Adzuna%', 'automated link checks refused for Adzuna'); end;
  begin perform record_check(jid('reed','r-future'), 'link', 'gone');
        perform ok(false, 'link check cannot say gone');
  exception when others then perform ok(sqlerrm like '%only an official source API%', 'only an official API may report "gone"'); end;
end $$;
select ok(not exists (select 1 from claim_jobs_for_check(1000, array['adzuna','reed']) c where c.source = 'adzuna'),
          'verification never claims Adzuna jobs');
update jobs set check_lock_until = null;

\echo '== Rate limits, timeouts and server errors never hide a job'
do $$ declare s text; i int; begin
  for i in 1..6 loop
    s := record_check(jid('reed','r-future'), 'source_api', 'transient', case when i % 2 = 0 then 429 else 503 end);
    perform ok(s in ('active','uncertain'), 'transient failure ' || i || ' leaves job visible (' || s || ')');
  end loop;
end $$;
select ok(st('reed','r-future') = 'uncertain', 'after 3+ inconclusive checks: "uncertain" (still shown)');
select ok((select next_check_at > now() + interval '23 hours' from jobs where external_id='r-future'), 'back-off reaches 24h');
select ok(record_check(jid('reed','r-future'), 'source_api', 'blocked', 403) = 'uncertain', '403/robots: recorded, not hidden');
select ok(record_check(jid('reed','r-future'), 'source_api', 'listed', 200) = 'active', 'next good answer: back to active');

\echo '== "Last checked" is not "Confirmed open"'
select ok((select last_checked_at is not null and last_confirmed_open_at is null from jobs where external_id='r-future'),
          'listed by the API: last checked set, confirmed open NOT set');
select record_check(jid('reed','r-future'), 'source_api', 'confirmed_open', 200);
select ok((select last_confirmed_open_at is not null from jobs where external_id='r-future'), 'confirmed_open sets confirmed open');

\echo '== Official API says gone / filled'
select ok(record_check(jid('reed','r-past'), 'source_api', 'gone', 200, '{"filled":true,"reason":"expired_flag"}') = 'filled', 'filled → hidden as filled');
select ok(record_check(jid('reed','r-past'), 'source_api', 'confirmed_open', 200) = 'filled', 'a later check never re-shows a filled job');

\echo '== Duplicates across sources'
select run_import('teaching_vacancies','GB', jsonb_build_array(tj('tv-1','GB', '{"fingerprint":"maths|oak school|leeds|GB","closes_at":null}'::jsonb || jsonb_build_object('closes_at',(now()+interval '20 days')::text))));
select run_import('adzuna','GB', tjs('gb', 1, 100) || jsonb_build_array(tj('adz-dup','GB','{"fingerprint":"maths|oak school|leeds|GB"}')));
select run_import('reed','GB', jsonb_build_array(tj('reed-dup','GB','{"fingerprint":"maths|oak school|leeds|GB","salary_min":30000}'),
  tj('r-none','GB', jsonb_build_object('apply_url','https://example.test/new-link')),
  tj('r-future','GB', jsonb_build_object('closes_at', (now() + interval '10 days')::text))));
select mark_duplicates();
select ok(st('teaching_vacancies','tv-1') = 'active', 'official source copy is the one shown');
select ok(st('adzuna','adz-dup') = 'duplicate' and st('reed','reed-dup') = 'duplicate', 'other copies hidden as duplicates');
select ok((select duplicate_of from jobs where external_id='adz-dup') = jid('teaching_vacancies','tv-1'), 'duplicate points at preferred copy');
update jobs set closes_at = now() - interval '1 minute' where external_id = 'tv-1';
select expire_jobs(); select mark_duplicates();
select ok(st('reed','reed-dup') = 'active', 'preferred copy closes → next best copy (Reed, has salary) shown');
select ok(st('adzuna','adz-dup') = 'duplicate', 'Adzuna copy still hidden behind Reed');

\echo '== More than 1,000 vacancies in one country'
select ok((run_import('adzuna','US', tjs('us', 1, 2500, 'US'))->>'fetched')::int = 2500, '2,500 jobs imported in pages of 50');
select run_import('adzuna','US', tjs('us', 1, 2500, 'US'));
select run_import('adzuna','US', tjs('us', 1, 2490, 'US'));
select run_import('adzuna','US', tjs('us', 1, 2490, 'US'));
select ok((select count(*) from jobs where country='US' and source='adzuna' and status='active') = 2490, 'exactly the 10 missing twice were removed');
set role anon;
select count(*) as anon_us from jobs where country = 'US' and source = 'adzuna' \gset
select count(*) as page_sum from (
  (select id from jobs where country='US' and source='adzuna' order by posted_at desc, id offset 0 limit 1000)
  union all (select id from jobs where country='US' and source='adzuna' order by posted_at desc, id offset 1000 limit 1000)
  union all (select id from jobs where country='US' and source='adzuna' order by posted_at desc, id offset 2000 limit 1000)) p \gset
select count(distinct id) as page_distinct from (
  (select id from jobs where country='US' and source='adzuna' order by posted_at desc, id offset 0 limit 1000)
  union all (select id from jobs where country='US' and source='adzuna' order by posted_at desc, id offset 1000 limit 1000)
  union all (select id from jobs where country='US' and source='adzuna' order by posted_at desc, id offset 2000 limit 1000)) p \gset
reset role;
select ok(:anon_us = 2490, 'public count matches active jobs (2,490)');
select ok(:page_sum = 2490 and :page_distinct = 2490, '1,000-row pages cover every job exactly once');

\echo '== Public access'
set role anon;
select count(*) as anon_hidden from jobs where status not in ('active','uncertain') \gset
select count(*) as anon_total from jobs \gset
reset role;
select ok(:anon_hidden = 0, 'public never sees hidden jobs');
select ok(:anon_total = (select count(*) from jobs where status in ('active','uncertain') and (closes_at is null or closes_at > now())),
          'public count = visible jobs');
set role anon;
select count(*) as anon_reports from job_reports \gset
select count(*) as anon_events from job_status_events \gset
reset role;
select ok(:anon_reports = 0 and :anon_events = 0, 'public cannot read reports or audit history');
do $$ declare f text; begin
  foreach f in array array['begin_source_run(text,text)','upsert_feed_jobs(bigint,jsonb)',
    'finish_source_run(bigint,boolean,text,boolean,boolean,timestamp with time zone)','expire_jobs()','claim_jobs_for_check(integer,text[])',
    'record_check(uuid,text,text,integer,jsonb)','mark_duplicates()','report_job(uuid,text,text)'] loop
    perform ok(not has_function_privilege('anon', f, 'execute'), 'anon cannot run ' || f);
    perform ok(not has_function_privilege('authenticated', f, 'execute'), 'signed-in users cannot run ' || f);
    perform ok(has_function_privilege('service_role', f, 'execute'), 'service role can run ' || f);
  end loop;
end $$;

\echo '== Visitor reports'
select ok(report_job(jid('reed','r-future'), 'link_broken') = 'recorded', 'report recorded');
select ok(st('reed','r-future') = 'active', 'a report alone never hides a job');
select ok((select next_check_at <= now() from jobs where external_id='r-future'), 'a report brings the next check forward');
do $$ declare i int; s text; begin
  for i in 1..25 loop s := report_job(jid('reed','r-future'), 'job_closed'); end loop;
  perform ok(s = 'limit_reached', 'reports capped at 20 per job per day');
end $$;
select ok(report_job(jid('adzuna','gb100'), 'other') in ('recorded','not_visible'), 'report on any job handled');
select ok(report_job(jid('reed','r-past'), 'other') = 'not_visible', 'hidden job cannot be reported');
select ok((select count(*) from job_alerts where kind='report_spike') = 1, 'report spike alert raised once');

\echo '== Mass-hide alarm'
update jobs set status = 'expired', status_reason = 'test' where source='adzuna' and country='US' and external_id in
  (select external_id from jobs where source='adzuna' and country='US' order by external_id limit 300);
select expire_jobs();
select ok((select count(*) from job_alerts where kind='mass_hide') = 1, 'hiding many jobs in a day raises one alert');

\echo '== Capped feeds (first page only): absence proves nothing'
select ok((run_import('adzuna','ZA', tjs('za', 1, 50, 'ZA'), true, false, false)->>'guard') = 'not_exhaustive', 'capped run: removals not applied');
select run_import('adzuna','ZA', tjs('za', 51, 100, 'ZA'), true, false, false);
select run_import('adzuna','ZA', tjs('za', 101, 150, 'ZA'), true, false, false);
select ok((select count(*) from jobs where source='adzuna' and country='ZA' and status='active') = 150,
          'jobs that dropped off page 1 for two runs are still shown');
select ok((select max(consecutive_missing) from jobs where country='ZA') = 0, 'capped runs do not count misses');
update jobs set last_seen_in_feed_at = now() - interval '22 days' where external_id in ('za1','za2','za3');
update jobs set last_seen_in_feed_at = now() - interval '20 days' where external_id = 'za4';
select ok((expire_jobs()->>'not_seen_21_days')::int = 3, 'not listed for 21+ days: hidden');
select ok(st('adzuna','za4') = 'active', 'not listed for 20 days: still shown');
select run_import('adzuna','ZA', jsonb_build_array(tj('za1','ZA')), true, false, false);
select ok(st('adzuna','za1') = 'active', 'listed again: shown again');

\echo '== Paged Adzuna search limited to the last 30 days (reconciliation window)'
-- 60 CA jobs: 40 posted within 30 days, 20 older. The 30-day search returns only the 40.
select run_import('adzuna','CA', (select jsonb_agg(tj('ca'||i,'CA', jsonb_build_object('posted_at', (now() - (i||' days')::interval)::text))) from generate_series(1,60) i));
-- switching to the 30-day window halves the count: a person confirms that once (p_accept_drop)
select ok((run_import('adzuna','CA', (select jsonb_agg(tj('ca'||i,'CA', jsonb_build_object('posted_at', (now() - (i||' days')::interval)::text))) from generate_series(1,29) i),
                  true, true, true, now() - interval '30 days')->>'missing_marked')::int = 0, 'first windowed run: older jobs not counted as missing');
select run_import('adzuna','CA', (select jsonb_agg(tj('ca'||i,'CA', jsonb_build_object('posted_at', (now() - (i||' days')::interval)::text))) from generate_series(1,29) i where i <> 15),
                  true, false, true, now() - interval '30 days');
select run_import('adzuna','CA', (select jsonb_agg(tj('ca'||i,'CA', jsonb_build_object('posted_at', (now() - (i||' days')::interval)::text))) from generate_series(1,29) i where i <> 15),
                  true, false, true, now() - interval '30 days');
select ok((select count(*) from jobs where country='CA' and status='active' and external_id ~ '^ca(3[1-9]|[45][0-9]|60)$') = 30,
          'jobs older than the search window are not removed for being absent');
select ok(st('adzuna','ca15') = 'removed_at_source', 'a job inside the window missing from two complete paged runs is removed');
select ok(st('adzuna','ca1') = 'active' and st('adzuna','ca29') = 'active', 'jobs still listed stay');

\echo '== A wrong relevance rule is undone by the next import'
select run_import('reed','GB', jsonb_build_array(tj('rel-1','GB','{"title":"Nursery Nurse","is_relevant":false}'),
  tj('r-none','GB', jsonb_build_object('apply_url','https://example.test/new-link')),
  tj('r-future','GB', jsonb_build_object('closes_at', (now() + interval '10 days')::text)), tj('reed-dup','GB','{"fingerprint":"maths|oak school|leeds|GB","salary_min":30000}')));
select ok(st('reed','rel-1') = 'not_relevant', 'old rule: hidden as not relevant (kept, not deleted)');
select run_import('reed','GB', jsonb_build_array(tj('rel-1','GB','{"title":"Nursery Nurse","is_relevant":true}'),
  tj('r-none','GB', jsonb_build_object('apply_url','https://example.test/new-link')),
  tj('r-future','GB', jsonb_build_object('closes_at', (now() + interval '10 days')::text)), tj('reed-dup','GB','{"fingerprint":"maths|oak school|leeds|GB","salary_min":30000}')));
select ok(st('reed','rel-1') = 'active', 'fixed rule: shown again on the next import');

\echo '== Nothing is ever deleted'
select ok((select count(*) from jobs where external_id like 'gb%' and source='adzuna') = 100, 'removed GB jobs still stored');
select ok((select count(*) from job_status_events) > 0, 'audit history present');
