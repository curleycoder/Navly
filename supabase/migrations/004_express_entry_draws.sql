-- express_entry_draws — stores parsed Express Entry draw results from IRCC.
-- Populated by /api/cron/sync-ee-draws (runs daily via Vercel Cron).
-- Public read, no write for authenticated users.

create table if not exists public.express_entry_draws (
  id               uuid        primary key default gen_random_uuid(),
  draw_number      integer     not null unique,
  draw_date        date        not null,
  draw_type        text        not null,    -- 'No Program Specified' | 'Canadian Experience Class' | 'French Language Proficiency' | 'Provincial Nominee Program' | etc.
  crs_cutoff       integer     not null,
  invitations      integer     not null,
  tie_break_rule   timestamptz,             -- null if not published / not applicable
  synced_at        timestamptz not null default now()
);

-- Most recent draw first
create index if not exists ee_draws_date_idx on public.express_entry_draws (draw_date desc);

-- Filter by type (e.g. French category draws)
create index if not exists ee_draws_type_idx on public.express_entry_draws (draw_type);

-- Public read-only
alter table public.express_entry_draws enable row level security;

create policy "Anyone can read express_entry_draws"
  on public.express_entry_draws for select
  using (true);
