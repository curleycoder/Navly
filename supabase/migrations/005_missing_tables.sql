-- Navly — tables that were created manually in the Supabase dashboard but never committed.
-- Run this against the database to bring migrations in sync with production.

-- ─── official_sources ─────────────────────────────────────────────────────────
-- RSS / web sources monitored by the sync-sources cron.
-- Written by the seeder (service role). No user-level access.

create table if not exists public.official_sources (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  url              text        not null unique,
  source_type      text        not null default 'rss',
  category         text        not null default 'general',
  authority_level  text        not null default 'official',
  check_frequency  text        not null default 'daily',
  active           boolean     not null default true,
  last_checked_at  timestamptz,
  last_changed_at  timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists official_sources_active_idx
  on public.official_sources (active)
  where active = true;

alter table public.official_sources enable row level security;
-- All reads and writes go through service role — no user-level policy needed.

-- ─── rule_snapshots ───────────────────────────────────────────────────────────
-- Verified IRCC rule data used by the AI assistant for RAG context.
-- Written by the seed-rules admin route (service role). No user-level access.

create table if not exists public.rule_snapshots (
  id              uuid        primary key default gen_random_uuid(),
  rule_key        text        not null unique,
  category        text        not null default 'general',
  data            jsonb       not null default '{}',
  source_url      text        not null default '',
  effective_date  date,
  status          text        not null default 'active',
  last_checked_at timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists rule_snapshots_status_idx
  on public.rule_snapshots (status)
  where status = 'active';

create index if not exists rule_snapshots_category_idx
  on public.rule_snapshots (category);

alter table public.rule_snapshots enable row level security;
-- All reads and writes go through service role — no user-level policy needed.

-- ─── immigration_updates ──────────────────────────────────────────────────────
-- Items detected from official_sources, reviewed by admin before publishing.
-- Written by sync-sources cron (service role). Read by admin routes only.

create table if not exists public.immigration_updates (
  id           uuid        primary key default gen_random_uuid(),
  source_id    uuid        references public.official_sources(id) on delete set null,
  title        text        not null,
  summary      text        not null default '',
  url          text        not null unique,
  category     text        not null default 'general',
  impact_level text        not null default 'low',
  affects      text[]      not null default '{}',
  published_at timestamptz not null,
  detected_at  timestamptz not null default now(),
  reviewed     boolean     not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists immigration_updates_reviewed_idx
  on public.immigration_updates (reviewed)
  where reviewed = false;

create index if not exists immigration_updates_published_at_idx
  on public.immigration_updates (published_at desc);

create index if not exists immigration_updates_category_idx
  on public.immigration_updates (category);

alter table public.immigration_updates enable row level security;
-- All reads and writes go through service role — no user-level policy needed.

-- ─── source_change_logs ───────────────────────────────────────────────────────
-- Audit log of content hash changes detected per source.
-- Written by sync-sources cron (service role). No user-level access.

create table if not exists public.source_change_logs (
  id             uuid        primary key default gen_random_uuid(),
  source_id      uuid        references public.official_sources(id) on delete cascade,
  old_hash       text,
  new_hash       text        not null,
  change_summary text        not null default '',
  raw_excerpt    text        not null default '',
  changed_at     timestamptz not null default now()
);

create index if not exists source_change_logs_source_id_idx
  on public.source_change_logs (source_id, changed_at desc);

alter table public.source_change_logs enable row level security;
-- All reads and writes go through service role — no user-level policy needed.
