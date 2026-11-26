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
| `LEADSMIND_DISABLED` | (unset) | `true` turns the sync off. Leads stay queued. |
| `LEADSMIND_BASE_URL` | `https://www.leadsmind.io` | LeadsMind origin |
| `LEADSMIND_FORM_ID` | `762edbd4-3d18-47c3-8d54-3c9209edf650` | Target form |
| `LEADSMIND_WORKSPACE_ID` | `94d419d2-76c1-43fb-90ca-65f096a898ee` | The form's workspace |
| `LEADSMIND_FIELD_MAP` | Test 33's field ids | JSON `{"firstName":"…","lastName":"…","email":"…"}` |
| `LEADSMIND_MAX_ATTEMPTS` | `12` | Attempts before `dead` |
| `CRON_SECRET` | (unset) | **Required** for the retry route. Without it the route answers 503. |
| `LEADSMIND_SYNC_START` | (unset) | ISO date. If set, the retry job also queues verified leads since then that have no queue row (never more than 2 days back). |

Invalid values (non-UUID form id, bad field map, non-https URL) switch the
sync off rather than sending leads to the wrong place.

**Changing the form:** field ids change when the form changes. Read them from
`GET https://www.leadsmind.io/api/public/forms/<form id>` (`form.fields[].id`)
and set `LEADSMIND_FORM_ID`, `LEADSMIND_WORKSPACE_ID` and `LEADSMIND_FIELD_MAP`.

## Scheduling the retry job

`vercel.json` schedules `/api/cron/leadsmind-retry` every 10 minutes. The
team is on Vercel **Pro**, which allows sub-daily crons (Hobby allows only
daily). Vercel Cron runs on **production deployments only**, and sends
`Authorization: Bearer <CRON_SECRET>` automatically once `CRON_SECRET` is set.
Each run:

1. queues missed leads (only when `LEADSMIND_SYNC_START` is set),
2. sends at most 5 due rows (LeadsMind's public limit is 5 a minute per IP),
3. deletes `sent` rows older than `LEADSMIND_RETENTION_DAYS` (default 180,
   minimum 30). `pending` and `dead` rows are never purged.

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
```

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
