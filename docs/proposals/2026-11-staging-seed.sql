-- =============================================================================
-- STAGING ONLY — synthetic data for wta-staging (fvhbwckoesjxiiktwkfy).
-- Every school, job and visitor here is invented. No production data.
-- Visitors use @example.com addresses (reserved for testing; no real inbox).
--
-- Safety guard: refuses to run if the database looks like production
-- (more than 50 jobs, or any lead or code already present).
-- Run after the migrations and both proposals.
-- =============================================================================
begin;

do $$
begin
  if (select count(*) from public.jobs) > 50 or (select count(*) from public.leads) > 0
     or (select count(*) from public.email_otps) > 0 then
    raise exception 'Refusing to seed: this database already has data (is it production?)';
  end if;
end $$;

-- 3,000 synthetic jobs across sources, countries, statuses and closing dates.
with params as (
  select i,
         (array['GB','US','ZA','AU','CA','SG','IN','DE','FR','NL','JP','KR','AE','QA','SA','CN','TH','VN','NZ','ES'])[1 + (i % 20)] as country,
         (array['teaching_vacancies','reed','adzuna','usajobs'])[1 + (i % 4)] as source,
         (array['Primary Teacher','Secondary Maths Teacher','Teaching Assistant','SEN Teacher','Early Years Practitioner',
                'ESL Teacher','Lecturer in Education','Online English Tutor','Head of Science','Cover Supervisor',
                'School Business Manager','Catering Assistant'])[1 + (i % 12)] as title
    from generate_series(1, 3000) i)
insert into public.jobs (source, external_id, title, description, company_name, country, city, employment_type,
                         salary_min, salary_max, currency, apply_url, posted_at, is_active,
                         status, closes_at, source_name, source_url, eligibility, is_restricted, fingerprint,
                         last_seen_in_feed_at, salary_is_predicted, salary_text)
select source, 'synthetic-' || i, title || ' (test ' || i || ')',
       'Synthetic listing for staging tests. Not a real vacancy.',
       'Test School ' || (i % 250), country, 'Testville ' || (i % 40),
       (array['full_time','part_time','contract','unspecified'])[1 + (i % 4)],
       case when i % 3 = 0 then null else 20000 + (i % 30) * 1000 end,
       case when i % 3 = 0 then null else 30000 + (i % 30) * 1000 end,
       case when i % 3 = 0 then null else 'GBP' end,
       'https://example.test/apply/' || source || '/' || i,
       now() - ((i % 90) || ' days')::interval,
       true,
       case when i % 50 = 0 then 'uncertain' else 'active' end,
       case when i % 5 = 0 then null else now() + ((i % 40) - 5 || ' days')::interval end,
       case source when 'teaching_vacancies' then 'Teaching Vacancies (Department for Education)'
                   when 'usajobs' then 'USAJOBS' when 'reed' then 'Reed' else 'Adzuna' end,
       case when source in ('teaching_vacancies','usajobs') then 'https://example.test/listing/' || i end,
       case when source = 'usajobs' and i % 2 = 0 then 'Current federal employees and military spouses' end,
       source = 'usajobs' and i % 2 = 0,
       lower(title) || '|test school ' || (i % 250) || '|testville ' || (i % 40) || '|' || country,
       now() - ((i % 10) || ' days')::interval,
       source = 'adzuna' and i % 2 = 0,
       case when source = 'teaching_vacancies' and i % 3 = 0 then '£25,000 - £30,000 Annually (Actual)' end
  from params;

-- A few synthetic visitors (no real people).
insert into public.leads (name, email, consent_given, purpose, marketing_opt_in, last_verified_at)
values ('Test Visitor One', 'visitor1@example.com', false, 'portal_access', false, now()),
       ('Test Visitor Two', 'visitor2@example.com', true, 'portal_access', true, now() - interval '30 days');

commit;
