\set ON_ERROR_STOP 1
set client_min_messages = warning;
create table if not exists test_results (n serial, label text, passed boolean);
create or replace function ok(cond boolean, label text) returns void language plpgsql as $$
begin
  insert into test_results (label, passed) values (label, coalesce(cond, false));
  if not coalesce(cond, false) then raise exception 'FAIL: %', label; end if;
end $$;
-- one normalised job, as the import code will send it
create or replace function tj(ext text, country text default 'GB', extra jsonb default '{}') returns jsonb
language sql as $$
  select jsonb_build_object('external_id', ext, 'title', 'Primary Teacher ' || ext, 'company_name', 'Test School',
    'country', country, 'city', 'Testville', 'apply_url', 'https://example.test/apply/' || ext,
    'posted_at', (now() - interval '3 days')::text, 'source_name', 'Test feed') || extra
$$;
create or replace function tjs(prefix text, n_from int, n_to int, country text default 'GB') returns jsonb
language sql as $$ select coalesce(jsonb_agg(tj(prefix || i, country)), '[]') from generate_series(n_from, n_to) i $$;
-- run one complete import of the given jobs for source/scope; returns finish summary
create or replace function run_import(p_source text, p_scope text, p_jobs jsonb, p_complete boolean default true,
                                      p_accept_drop boolean default false, p_exhaustive boolean default true,
                                      p_window_start timestamptz default null) returns jsonb
language plpgsql as $$
declare v_run bigint; v_page jsonb; i int := 0;
begin
  v_run := begin_source_run(p_source, p_scope);
  if v_run is null then raise exception 'run already in progress'; end if;
  -- pages of 50, like the providers
  while i < jsonb_array_length(p_jobs) loop
    select coalesce(jsonb_agg(e), '[]') into v_page
      from (select e from jsonb_array_elements(p_jobs) with ordinality t(e, k) where k > i and k <= i + 50) s;
    perform upsert_feed_jobs(v_run, v_page);
    i := i + 50;
  end loop;
  return finish_source_run(v_run, p_complete, case when p_complete then null else 'simulated outage' end, p_accept_drop, p_exhaustive, p_window_start);
end $$;
create or replace function st(p_source text, ext text) returns text language sql as
  $$ select status from jobs where source = p_source and external_id = ext $$;
create or replace function jid(p_source text, ext text) returns uuid language sql as
  $$ select id from jobs where source = p_source and external_id = ext $$;
