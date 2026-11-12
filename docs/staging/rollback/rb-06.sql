-- STAGING ONLY rollback for step 06 on wta-staging (fvhbwckoesjxiiktwkfy). Needs separate approval.
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
  grant select on table public.jobs to anon, authenticated;
  drop function if exists public.revoke_portal_access(text,text), public.apply_visitor_retention(int,int,int,int),
    public.export_visitor_data(text), public.erase_visitor(text);
  -- portal_sessions, marketing_suppressions and the new columns stay (harmless history);
  -- the consent_required rule is not re-added because new rows may have consent_given = false.
