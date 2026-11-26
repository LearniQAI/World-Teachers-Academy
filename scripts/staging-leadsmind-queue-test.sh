#!/usr/bin/env bash
# STAGING ONLY: exercises the LeadsMind retry queue on the feat/leadsmind-job-portal-sync
# preview (wta-staging DB + LeadsMind staging). Never point it at production.
#
# Run from a terminal; it asks for three secrets without echoing them, and never
# prints them. Output: HTTP status + JSON for each step (queue metadata only).
#
#   bash scripts/staging-leadsmind-queue-test.sh <step>
#   steps: auth | summary | concurrent | run | retry <outbox-id> | retry-dead
set -euo pipefail

BASE="${WTA_PREVIEW_URL:-https://world-teachers-academy-git-feat-4f5483-nelly-agboolas-projects.vercel.app}"
case "$BASE" in
  *worldteachers.academy*|*world-teachers-academy.vercel.app*|*git-main*) echo "Refusing: $BASE looks like production." >&2; exit 1;;
esac

ask() { local v; read -r -s -p "$1: " v; echo >&2; printf '%s' "$v"; }
BYPASS="${VERCEL_BYPASS:-$(ask 'Vercel protection bypass secret (Settings > Deployment Protection)')}"
CRON="${CRON_SECRET_VALUE:-$(ask 'CRON_SECRET (preview value)')}"
ADMIN="${ADMIN_SECRET_VALUE:-$(ask 'LEADSMIND_ADMIN_SECRET (preview value)')}"

call() { # method path auth-secret [json]
  local m="$1" p="$2" s="$3" d="${4:-}"
  local out; out=$(mktemp)   # one file per call: parallel calls must not share it
  local args=(-s -o "$out" -w '%{http_code}' -X "$m" -H "x-vercel-protection-bypass: $BYPASS")
  [ -n "$s" ] && args+=(-H "Authorization: Bearer $s")
  [ -n "$d" ] && args+=(-H 'content-type: application/json' -d "$d")
  local code; code=$(curl "${args[@]}" "$BASE$p")
  echo "$(date -u +%T) $m $p -> $code $(head -c 1500 "$out")"; rm -f "$out"
}
TEST_EMAIL="info@docssa.co.za"   # the only address on the preview's email allow-list

case "${1:-}" in
  auth)
    call GET /api/cron/leadsmind-retry ""
    call GET /api/cron/leadsmind-retry "wrong-secret"
    call GET /api/admin/leadsmind-outbox ""
    call GET /api/admin/leadsmind-outbox "wrong-secret"
    call GET /api/admin/leadsmind-outbox "$CRON"   # the cron secret must NOT open the admin route
    ;;
  summary) call GET "/api/admin/leadsmind-outbox?limit=20" "$ADMIN" ;;
  concurrent)
    echo "Firing 6 retry-job calls at the same moment..."
    for i in 1 2 3 4 5 6; do call GET /api/cron/leadsmind-retry "$CRON" & done; wait ;;
  run) call GET /api/cron/leadsmind-retry "$CRON" ;;
  retry) call POST /api/admin/leadsmind-outbox "$ADMIN" "{\"action\":\"retry\",\"id\":\"${2:?outbox id}\"}" ;;
  retry-dead) call POST /api/admin/leadsmind-outbox "$ADMIN" '{"action":"retry_dead"}' ;;
  # Already verified for this job in the last 24 h: must skip the code (no email, no new lead).
  verified-skip) call POST /api/leads/request-code "" "{\"name\":\"WTA E2E Test\",\"email\":\"$TEST_EMAIL\",\"job_id\":\"${2:?job id}\",\"consent_given\":true}" ;;
  # Address not on EMAIL_TEST_ALLOWLIST: no email may be sent.
  allowlist) call POST /api/leads/request-code "" "{\"name\":\"WTA E2E Blocked\",\"email\":\"wta-e2e-blocked@example.com\",\"job_id\":\"${2:?job id}\",\"consent_given\":true}" ;;
  # A wrong code for an open request: must be refused with attempts left.
  wrong-code) call POST /api/leads/verify "" "{\"email\":\"$TEST_EMAIL\",\"job_id\":\"${2:?job id}\",\"code\":\"000000\"}" ;;
  *) echo "usage: $0 auth|summary|concurrent|run|retry <id>|retry-dead|verified-skip <job>|allowlist <job>|wrong-code <job>" >&2; exit 2 ;;
esac
