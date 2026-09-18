-- Schedule the ingest-jobs Edge Function to run once daily via pg_cron + pg_net.
-- The service role key used to authorize the invocation is stored in Supabase
-- Vault (as secret 'ingest_jobs_service_role_key') out-of-band, never in a
-- committed migration, and is looked up at execution time.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'ingest-jobs-daily',
    '0 3 * * *', -- 03:00 UTC daily
    $$
    select
      net.http_post(
        url := 'https://nxwmtcsezswjrignajdm.supabase.co/functions/v1/ingest-jobs',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select decrypted_secret from vault.decrypted_secrets
            where name = 'ingest_jobs_service_role_key'
          )
        )
      ) as request_id;
    $$
  );
