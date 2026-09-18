-- Job portal: jobs (ingested from Adzuna) and leads (apply-gate submissions)

create table jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null, -- 'adzuna'
  external_id text not null,
  title text not null,
  description text,
  company_name text,
  country text not null, -- ISO country code
  city text,
  employment_type text, -- full_time / part_time / contract / unspecified
  salary_min numeric,
  salary_max numeric,
  currency text,
  apply_url text not null,
  posted_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (source, external_id)
);

create index jobs_country_idx on jobs (country);
create index jobs_is_active_idx on jobs (is_active);

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  job_id uuid references jobs(id),
  consent_given boolean not null default false,
  source_ip inet,
  applied_at timestamptz default now(),
  constraint consent_required check (consent_given = true)
);

alter table jobs enable row level security;
alter table leads enable row level security;

-- jobs: public read of active postings only; all writes are service-role only (no policy needed,
-- since service role bypasses RLS, and no insert/update/delete policy exists for anon/authenticated).
create policy "Public can read active jobs"
  on jobs for select
  using (is_active = true);

-- leads: no public select, no public insert. Only the service role (used server-side in the
-- /api/leads route) can write, and only the service role can read.
