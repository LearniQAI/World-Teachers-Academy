-- STAGING ONLY — wta-staging (fvhbwckoesjxiiktwkfy). Step 0 of the staging setup.
-- Marks this database as staging so every later file can check it.
-- Refuses to run unless the database is completely empty (production is not).
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public')
     or (select count(*) from auth.users) > 0
     or to_regclass('wta_meta.environment') is not null then
    raise exception 'STOP: database is not an empty new project. Nothing was applied.';
  end if;
end $$;

create schema wta_meta;
revoke all on schema wta_meta from public, anon, authenticated;
create table wta_meta.environment (
  project_ref text primary key,
  label text not null check (label = 'staging'),
  created_at timestamptz not null default now()
);
revoke all on table wta_meta.environment from public, anon, authenticated;
insert into wta_meta.environment (project_ref, label) values ('fvhbwckoesjxiiktwkfy', 'staging');
