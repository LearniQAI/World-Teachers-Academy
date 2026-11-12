#!/usr/bin/env bash
# Applies the staging SQL to wta-staging ONLY. Every safeguard below must pass,
# or nothing runs:
#   1. STAGING_DB_URL must point at db.fvhbwckoesjxiiktwkfy.supabase.co (or the
#      pooler user postgres.fvhbwckoesjxiiktwkfy); any other host is refused.
#   2. Every file must match its SHA-256 in MANIFEST.sha256 (no edits since review).
#   3. Each file runs as ONE transaction (psql -1) and starts with a guard that
#      checks the database's wta_meta.environment marker; on any other database
#      the guard raises an error and the whole file is rolled back.
# The scheduling migration (20260918110500_schedule_ingest_jobs.sql) is not in
# this list and never runs on staging.
set -euo pipefail
cd "$(dirname "$0")"
REF=fvhbwckoesjxiiktwkfy
URL="${STAGING_DB_URL:?Set STAGING_DB_URL to the wta-staging connection string}"
case "$URL" in
  *"@db.$REF.supabase.co"*|*"postgres.$REF:"*|*"postgres.$REF@"*) ;;
  *) echo "REFUSED: STAGING_DB_URL is not wta-staging ($REF)." >&2; exit 2 ;;
esac
sha256sum --quiet -c MANIFEST.sha256 || { echo "REFUSED: a file differs from the reviewed version." >&2; exit 3; }
FILES=(
  00-environment-marker.sql
  01-20260918105924_job_portal_schema.sql
  02-20260920120000_create_posts.sql
  03-20260924120000_audio_bucket.sql
  04-20260928120000_email_otps.sql
  05-2026-11-job-verification.sql
  06-2026-11-portal-access.sql
  07-2026-11-staging-seed.sql
)
for f in "${@:-${FILES[@]}}"; do
  [[ " ${FILES[*]} " == *" $f "* ]] || { echo "REFUSED: $f is not an approved staging file." >&2; exit 4; }
  echo "applying $f"
  psql "$URL" -X -q -1 -v ON_ERROR_STOP=1 -f "$f"
done
echo "done"
