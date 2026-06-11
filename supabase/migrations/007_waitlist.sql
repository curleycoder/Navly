-- Waitlist for features not yet supported (e.g. Quebec immigration)
create table if not exists waitlist (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  interest   text,          -- e.g. 'QC' — which feature/province they are waiting for
  created_at timestamptz not null default now()
);

-- Only service-role key can insert; no public read/write
alter table waitlist enable row level security;
