-- Email OTP verification gate in front of the job portal apply flow (leads).
-- A code is issued per email+job request and must be verified before a
-- `leads` row is created — see app/api/leads/request-code and /verify.

create table public.email_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  job_id uuid references public.jobs(id),
  name text not null,
  code_hash text not null,
  ip inet,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  attempts int not null default 0,
  max_attempts int not null default 5,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Lookup pattern for /verify: newest unconsumed row for a given email+job_id.
create index email_otps_email_job_idx on public.email_otps (email, job_id, created_at desc);
-- Rate-limit windows in /request-code scan recent rows by email and by ip.
create index email_otps_created_at_idx on public.email_otps (created_at);
create index email_otps_ip_created_at_idx on public.email_otps (ip, created_at);

alter table public.email_otps enable row level security;

-- No public access at all; only the service role (used server-side in
-- /api/leads/request-code and /api/leads/verify) touches this table.
create policy "Service role can do anything"
  on public.email_otps for all
  using (auth.role() = 'service_role');
