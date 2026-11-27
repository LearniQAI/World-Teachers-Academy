# Job portal → LeadsMind CRM sync

Every applicant who **verifies their email** on `/job-portal` is also submitted
to a LeadsMind form, so they appear as a contact in the LeadsMind CRM. The
applicant's experience is unchanged: same pop-up, same 6-digit code email,
same redirect to the job.

## How it works

1. `POST /api/leads/request-code`: unchanged. Nothing is sent to LeadsMind
   here, so unverified sign-ups never reach the CRM.
2. `POST /api/leads/verify`: after the code matches and the `leads` row is
   created, the lead is queued in `leadsmind_outbox` **before** the response
   is returned. This adds one database insert.
3. After the response, Next.js `after()` delivers the queued row to
   `POST {LEADSMIND_BASE_URL}/api/public/forms/{LEADSMIND_FORM_ID}/submit`,
   which is the same endpoint the hosted LeadsMind form uses.
4. If delivery fails (LeadsMind down, timeout, 5xx, 429 rate limit), the row
   stays `pending` with back-off (1, 2, 4 … minutes, capped at 12 h). Retries
   run on `/api/cron/leadsmind-retry` and opportunistically on later
   verifications. After `LEADSMIND_MAX_ATTEMPTS` (default 12) the row becomes
   `dead`. It is kept, never deleted. Rate-limited (429) rows never go `dead`.

### Duplicates and existing contacts

- One queue row per lead and form (`unique (lead_id, form_id)`).
- Each row has a fixed `client_submission_id`, which is LeadsMind's idempotency
  key. A retry after a lost response does not create a second submission.
- LeadsMind matches contacts by email within the workspace. A returning
  applicant gets a new *submission* (one per application, with the job in the
  attribution) on the **same contact**. Existing contact fields (name, phone,
  company …) are only filled when empty. They are never overwritten.

### Consent

Email verification is **not** marketing consent. The sync never sends
LeadsMind's marketing-consent key (`lm_email_marketing_consent`), and
`leadsmind_outbox.marketing_consent` is always `false`. LeadsMind still stamps
its standard processing record (`consent_timestamp`, `consent_form_id`) on the
contact, as it does for every form submission. That is a record of data
processing, not a marketing opt-in.

### Logging

Only queue ids, attempt numbers, HTTP status codes and short error classes are
logged. Names, emails, request bodies and LeadsMind response bodies are never
logged (covered by `tests/unit/leadsmind.test.ts`).

## Configuration (Vercel environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `LEADSMIND_DISABLED` | (unset) | `true` pauses **delivery** only. Verified leads are still queued and are sent automatically when it is unset again. |
| `LEADSMIND_BASE_URL` | `https://www.leadsmind.io` | LeadsMind origin |
| `LEADSMIND_FORM_ID` | `762edbd4-3d18-47c3-8d54-3c9209edf650` | Target form |
| `LEADSMIND_WORKSPACE_ID` | `94d419d2-76c1-43fb-90ca-65f096a898ee` | The form's workspace |
| `LEADSMIND_FIELD_MAP` | Test 33's field ids | JSON `{"firstName":"…","lastName":"…","email":"…"}` |
| `LEADSMIND_MAX_ATTEMPTS` | `12` | Attempts before `dead` |
| `CRON_SECRET` | (unset) | **Required** for the retry route. Without it the route answers 503. |
| `LEADSMIND_SYNC_START` | (unset) | **Set this to the go-live time in production.** Every run queues each verified lead since then that has no queue row, with no age limit. This recovers applicants from a pause or a deployment rollback. Leads before it are never sent automatically. |
| `LEADSMIND_ALERT_EMAIL` | (unset) | Where sync alerts go. Unset means no alerts. |

Invalid values (non-UUID form id, bad field map, non-https URL) switch the
sync off rather than sending leads to the wrong place.

**Changing the form:** field ids change when the form changes. Read them from
`GET https://www.leadsmind.io/api/public/forms/<form id>` (`form.fields[].id`)
and set `LEADSMIND_FORM_ID`, `LEADSMIND_WORKSPACE_ID` and `LEADSMIND_FIELD_MAP`.

## Scheduling, recovery and alerts

`vercel.json` runs `/api/cron/leadsmind-retry` **every 2 minutes**. Vercel Cron
runs on production deployments only (the team is on Pro) and sends
`Authorization: Bearer <CRON_SECRET>`. Each run:

1. **Catch-up:** queues every verified lead since `LEADSMIND_SYNC_START` that
   has no queue row. This covers leads verified while the site was rolled back
   to a version without this integration, or when a queue insert failed. It is
   set-based and idempotent (`unique (lead_id, form_id)`), so parallel runs and
   large backlogs are safe. It runs even while delivery is paused.
2. **Delivery:** up to 5 due rows (LeadsMind's public limit is 5 a minute per
   IP; a 429 defers the rest). Skipped while `LEADSMIND_DISABLED=true`.
   Capacity is about 3,600 leads a day. New leads are also sent within
   seconds of verification.
3. **Retention:** deletes `sent` rows older than `LEADSMIND_RETENTION_DAYS`.
4. **Alerts** (`LEADSMIND_ALERT_EMAIL`):
   - a critical alert as soon as any lead is `dead`, a lead has waited more
     than 2 hours, or the configuration is invalid;
   - re-sent only when the kind of problem changes, and at most once an hour;
   - a daily summary from 07:00 SAST while anything is unresolved;
   - one "recovered" email when it clears;
   - if sending an alert fails, all alerts pause for 15 minutes and the send is retried;
   - statistics only: no names, emails or lead ids.

### Recovery scenarios

| Scenario | What happens | Action needed |
| --- | --- | --- |
| LeadsMind down or slow, even for days | Leads queue and retry with back-off. After 12 failed attempts they become `dead`, which triggers an alert. A **recovery probe** retries one dead lead after 1 h, then 2 h, 4 h and every 6 h. All dead leads wait for the same probe, so a long outage costs a handful of calls. When a probe or any delivery succeeds, every dead lead is re-queued automatically, even if nobody applies. | None. `retry_dead` is still available. |
| LeadsMind rejects the request (400/401/403/404/409/410/422: wrong form id, unpublished form, validation) | Treated as **permanent**: gives up after 3 tries, alerts, and is probed once a day. Once the cause is fixed, the next daily probe recovers everything. | Fix the cause. `retry_dead` recovers at once. |
| Sync paused (`LEADSMIND_DISABLED=true`) | Applicants unaffected, and leads queue. | Unset it; everything queued is sent. |
| Site rolled back to the pre-integration release | Applicants unaffected. Leads are saved in `leads` but not queued. | Re-deploy the integration. The next run's catch-up queues them (no age limit). |
| Queue insert failed | Lead saved, not queued | Automatic: the next run's catch-up queues it. |
| Anything else | | `backfill_preview` (dry run), then `backfill`, with a start date. |

## Admin: visibility and manual retry

`/api/admin/leadsmind-outbox`, with `Authorization: Bearer <LEADSMIND_ADMIN_SECRET>`.
Without that variable it refuses everything (503). Responses carry queue metadata
only, never names or emails.

```bash
# counts per status + the 50 newest rows (optionally ?status=dead)
curl -s -H "Authorization: Bearer $LEADSMIND_ADMIN_SECRET" https://worldteachers.academy/api/admin/leadsmind-outbox
# re-queue one row (dead or pending; sent rows are refused, so nothing is sent twice)
curl -s -X POST -H "Authorization: Bearer $LEADSMIND_ADMIN_SECRET" -H 'content-type: application/json' \
  -d '{"action":"retry","id":"<outbox id>"}' https://worldteachers.academy/api/admin/leadsmind-outbox
# re-queue all dead rows / deliver due rows now
-d '{"action":"retry_dead"}'    -d '{"action":"run"}'
# recovery: dry run first, then queue (since defaults to LEADSMIND_SYNC_START)
-d '{"action":"backfill_preview"}'    -d '{"action":"backfill"}'
-d '{"action":"backfill","since":"2026-12-01T00:00:00Z"}'
```

`GET` also returns `sync` (enabled, configuration problems, sync start,
alerts configured) and `health`. `health` holds counts per status, leads
waiting more than 2 h, dead count, the oldest pending, the **last successful
sync**, and error types.

The same data is visible in the Supabase dashboard (table `leadsmind_outbox`,
or `select * from leadsmind_outbox_summary();`).

## Staging safety

On a Vercel Preview (`VERCEL_ENV=preview`) the code email is only sent to
addresses in `EMAIL_TEST_ALLOWLIST`. With no list, previews send no email at
all. The preview sends from `RESEND_FROM_EMAIL` =
`World Teachers Academy STAGING <wta-staging@staging-mail.leadsmind.io>` with its
own Resend key; production leaves `RESEND_FROM_EMAIL` unset and sends from
`noreply@notify.worldteachers.academy` (verified in the docssa Resend workspace,
DNS at Namecheap; restored 26 Nov 2026). Preview variables for this branch point at the `wta-staging` database
and the LeadsMind **staging** test form, never production.

## Checking the queue (SQL)

```sql
select * from leadsmind_outbox_summary();
select id, lead_id, attempts, last_status_code, last_error, next_attempt_at
  from leadsmind_outbox where status in ('pending','dead') order by created_at;
select retry_leadsmind_outbox('<id>');   -- manual retry of one row
```
