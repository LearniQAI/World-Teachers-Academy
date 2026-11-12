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
-- ===== original file follows (standalone begin;/commit; lines removed: the runner wraps the whole file in one transaction) =====
-- Audio: public bucket for the custom player (country debates, resource guides).
-- Files are written once by scripts/import-audio.ts using the service role key.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 104857600, array['audio/mpeg', 'application/json'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public (anon + authenticated) can read. There are deliberately no insert/update/delete
-- policies: only the service role (which bypasses RLS) can write.
create policy "Public can read audio"
  on storage.objects for select
  using (bucket_id = 'audio');
