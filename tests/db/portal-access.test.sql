\set ON_ERROR_STOP 1
set client_min_messages = warning;
create table if not exists test_results (n serial, label text, passed boolean);
create or replace function ok(cond boolean, label text) returns void language plpgsql as $$
begin insert into test_results (label, passed) values (label, coalesce(cond,false));
  if not coalesce(cond,false) then raise exception 'FAIL: %', label; end if; end $$;
create or replace function anon_can(q text) returns boolean language plpgsql as $$
begin execute 'set local role anon'; execute q; execute 'reset role'; return true;
exception when insufficient_privilege then return false; end $$;

\echo '== Protected apply links'
insert into jobs (source, external_id, title, country, apply_url, posted_at, is_active)
  select 'reed', 'r'||i, 'Teacher '||i, 'GB', 'https://www.reed.co.uk/jobs/'||i, now(), i <= 9 from generate_series(1,10) i;
begin; select ok(anon_can('select 1 from jobs where title is not null'), 'anon can still list jobs (title, country, …)'); commit;
begin; select ok(not anon_can('select apply_url from jobs'), 'anon cannot read apply_url'); commit;
begin; select ok(not anon_can('select j.* from jobs j'), 'anon cannot select * (would include apply_url)'); commit;
begin; select ok(not anon_can('select 1 from jobs where apply_url like ''%reed%'''), 'anon cannot filter or probe by apply_url'); commit;
begin; select ok(not anon_can('select apply_url from jobs') and not (select bool_or(has_column_privilege('authenticated','jobs','apply_url','select'))), 'signed-in users cannot read apply_url either'); commit;
set role anon; select count(*) as anon_rows from jobs \gset
reset role;
select ok(:anon_rows = 9, 'row security unchanged: anon sees the 9 active jobs only');
set role service_role; select count(apply_url) as svc_urls from jobs \gset
reset role;
select ok(:svc_urls = 10, 'service role (the website server) reads apply_url');
begin; select ok(not anon_can('insert into jobs (source, external_id, title, country, apply_url) values (''x'',''x'',''x'',''GB'',''x'')'), 'anon cannot insert jobs'); commit;

\echo '== Sessions'
insert into leads (name, email, consent_given, purpose, marketing_opt_in) values ('Jane', 'jane@example.com', false, 'portal_access', false);
select ok((select count(*) from leads where email='jane@example.com' and not consent_given and not marketing_opt_in) = 1,
          'a visitor who declines marketing can still be recorded for access');
insert into portal_sessions (lead_id, expires_at) select id, now() + interval '90 days' from leads where email='jane@example.com';
insert into portal_sessions (lead_id, expires_at) select id, now() + interval '90 days' from leads where email='jane@example.com';
select ok(revoke_portal_access('JANE@example.com ') = 2, 'revoke_portal_access ends every session of that visitor');
select ok((select count(*) from portal_sessions where revoked_at is null) = 0, 'no active session left');
begin; select ok(not anon_can('select 1 from portal_sessions'), 'anon cannot read sessions'); commit;
begin; select ok(not anon_can('select 1 from leads'), 'anon cannot read leads'); commit;
begin; select ok(not anon_can('select 1 from email_otps'), 'anon cannot read verification codes'); commit;
begin; select ok(not anon_can('select 1 from marketing_suppressions'), 'anon cannot read the suppression list'); commit;
do $$ declare f text; begin
  foreach f in array array['revoke_portal_access(text,text)','apply_visitor_retention(integer,integer,integer,integer)',
                           'export_visitor_data(text)','erase_visitor(text)'] loop
    perform ok(not has_function_privilege('anon', f, 'execute'), 'anon cannot run ' || f);
  end loop; end $$;

\echo '== Retention (functions only; nothing scheduled)'
insert into email_otps (email, name, code_hash, created_at) values
  ('old@example.com','Old','h', now() - interval '3 days'), ('new@example.com','New','h', now());
insert into leads (name, email, consent_given, source_ip, applied_at, last_verified_at) values
  ('Old visitor','old@example.com', true, '203.0.113.5', now() - interval '30 months', now() - interval '30 months'),
  ('Recent visitor','recent@example.com', true, '203.0.113.6', now() - interval '100 days', now() - interval '100 days'),
  ('Active visitor','active@example.com', true, null, now() - interval '30 months', now() - interval '30 months');
insert into portal_sessions (lead_id, expires_at) select id, now() + interval '10 days' from leads where email='active@example.com';
insert into portal_sessions (lead_id, expires_at, created_at) select id, now() - interval '40 days', now() - interval '130 days' from leads where email='recent@example.com';
do $$ begin
  begin perform apply_visitor_retention(0, 30, 90, 24); perform ok(false, 'unsafe period refused');
  exception when others then perform ok(sqlerrm like '%safety minimums%', 'periods below the safety minimums are refused'); end;
end $$;
select apply_visitor_retention() as r \gset
select ok((select count(*) from email_otps where email='old@example.com') = 0 and (select count(*) from email_otps where email='new@example.com') = 1, 'old codes deleted, today''s kept');
select ok((select count(*) from portal_sessions s join leads l on l.id=s.lead_id where l.email='recent@example.com') = 0, 'sessions expired over 30 days ago deleted');
select ok((select source_ip from leads where email='recent@example.com') is null, 'IP addresses older than 90 days blanked');
select ok((select count(*) from leads where name='Old visitor') = 0 and (select count(*) from leads where email like 'removed+%') = 1, 'visitor inactive for 24+ months anonymised, row kept for counts');
select ok((select name from leads where email='active@example.com') = 'Active visitor', 'visitor with an active session is kept even if old');
select ok((select count(*) from leads where email='jane@example.com') = 1, 'recent visitor untouched');

\echo '== Access and deletion requests'
select ok((export_visitor_data('jane@example.com')->'leads'->0->>'email') = 'jane@example.com', 'export returns what is held about the visitor');
select ok((erase_visitor('jane@example.com')->>'visitors_anonymised')::int = 1, 'erase anonymises the visitor');
select ok(not exists (select 1 from leads where email='jane@example.com'), 'no trace of the email in leads');
select ok(exists (select 1 from marketing_suppressions where email_sha256 = encode(sha256(convert_to('jane@example.com','UTF8')),'hex')), 'email kept only as a hash on the do-not-contact list');
