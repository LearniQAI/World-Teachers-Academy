#!/usr/bin/env bash
# Local only: verified-access proposal on a throwaway database.
set -euo pipefail
cd "$(dirname "$0")"
HOST=${PGTEST_HOST:-/tmp}; PORT=${PGTEST_PORT:-55432}; DB=wta_portal_test
case "$HOST" in /*|localhost|127.0.0.1) ;; *) echo "Refusing non-local host" >&2; exit 2 ;; esac
P="psql -X -q -v ON_ERROR_STOP=1 -h $HOST -p $PORT -U ${PGTEST_USER:-wta}"
$P -d postgres -c "drop database if exists $DB" -c "create database $DB" >/dev/null
$P -d $DB -f portal-setup.sql
$P -d $DB -f ../../supabase/migrations/20260918105924_job_portal_schema.sql
$P -d $DB -f ../../supabase/migrations/20260928120000_email_otps.sql
$P -d $DB -f ../../docs/proposals/2026-11-portal-access.sql
$P -d $DB -o /dev/null -f portal-access.test.sql
$P -d $DB -At -c "select count(*) filter (where passed) || ' passed, ' || count(*) filter (where not passed) || ' failed' from test_results"
