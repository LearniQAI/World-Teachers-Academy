#!/usr/bin/env bash
# Runs the job-verification proposal and its scenario tests on a LOCAL throwaway
# Postgres (default: socket /tmp, port 55432). Refuses anything that looks remote.
set -euo pipefail
cd "$(dirname "$0")"
HOST=${PGTEST_HOST:-/tmp}; PORT=${PGTEST_PORT:-55432}; USER_=${PGTEST_USER:-wta}; DB=wta_verification_test
case "$HOST" in /*|localhost|127.0.0.1) ;; *) echo "Refusing non-local host $HOST" >&2; exit 2 ;; esac
P="psql -X -q -v ON_ERROR_STOP=1 -h $HOST -p $PORT -U $USER_"
$P -d postgres -c "drop database if exists $DB" -c "create database $DB" >/dev/null
$P -d $DB -f setup.sql
$P -d $DB -f ../../supabase/migrations/20260918105924_job_portal_schema.sql
$P -d $DB -f legacy.sql
$P -d $DB -f ../../docs/proposals/2026-11-job-verification.sql
$P -d $DB -o /dev/null -f helpers.sql
$P -d $DB -o /dev/null -f verification.test.sql
bash concurrency.sh "$P -d $DB"
$P -d $DB -At -c "select count(*) filter (where passed) || ' passed, ' || count(*) filter (where not passed) || ' failed' from test_results"
