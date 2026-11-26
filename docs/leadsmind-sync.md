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

The repo has no `vercel.json` cron (Hobby plans only allow daily crons). Use
Supabase `pg_cron`, the same pattern as `ingest-jobs`. Run once in the SQL
editor after storing the secret in Vault as `leadsmind_retry_cron_secret`
(same value as Vercel's `CRON_SECRET`):

```sql
select cron.schedule(
  'leadsmind-retry-10min',
  '*/10 * * * *',
  $$
  select net.http_get(
    url := 'https://worldteachers.academy/api/cron/leadsmind-retry',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'leadsmind_retry_cron_secret'
      )
    )
  );
  $$
);
```

Each run sends at most 5 leads, matching LeadsMind's public limit of
5 submissions per minute per sending IP.

## Checking the queue

```sql
select status, count(*), max(attempts), min(created_at) from leadsmind_outbox group by status;
select id, lead_id, attempts, last_status_code, last_error, next_attempt_at
  from leadsmind_outbox where status in ('pending','dead') order by created_at;
-- Re-queue a dead row after fixing the cause:
update leadsmind_outbox set status='pending', attempts=0, next_attempt_at=now() where id='…';
```
