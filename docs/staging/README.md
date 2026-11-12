# wta-staging SQL package (project fvhbwckoesjxiiktwkfy)

Staging only. Nothing here may be applied to production (nxwmtcsezswjrignajdm).

Order: 00 → 07. Rollback: rollback/rb-07 → rb-00 (reverse order).
`supabase/migrations/20260918110500_schedule_ingest_jobs.sql` is excluded: it
schedules a daily call to production's import function.

Safeguards
- 00 refuses unless the database is brand new (no public tables, no users) and
  then records the marker `wta_meta.environment = fvhbwckoesjxiiktwkfy`.
- 01–07 and every rollback start with a guard that refuses unless that marker
  exists. Production has no marker, so every file refuses there.
- Each file has no BEGIN/COMMIT of its own and runs as one transaction, so a
  refusal or error leaves nothing behind.
- apply-staging.sh (for running by hand with psql) also refuses any connection
  string that isn't wta-staging, any file not in the approved list, and any
  file whose SHA-256 differs from MANIFEST.sha256.

Body of 01–07 = the original file with only the guard added and standalone
`begin;` / `commit;` lines removed (checked with diff).
