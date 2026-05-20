-- ircc_news — stores parsed items from the IRCC RSS feeds.
-- Populated by the /api/cron/news route (runs 2x per day via Vercel Cron).
-- Public read, no write access for authenticated users.

create table if not exists public.ircc_news (
  id            text primary key,                        -- RSS guid / link URL
  title         text        not null,
  summary       text        not null default '',
  source_url    text        not null,
  source_name   text        not null,                    -- 'IRCC' | 'IRCC Notices' | 'Canada Gazette'
  published_at  timestamptz not null default now(),
  category      text        not null default 'general',  -- matches NewsCategory
  importance    text        not null default 'low',      -- 'low' | 'medium' | 'high'
  affected_users text[]     not null default '{}',
  fetched_at    timestamptz not null default now()
);

-- Most recent first index
create index if not exists ircc_news_published_at_idx on public.ircc_news (published_at desc);

-- Category filter index
create index if not exists ircc_news_category_idx on public.ircc_news (category);

-- Public read-only — no auth required to see news
alter table public.ircc_news enable row level security;

create policy "Anyone can read ircc_news"
  on public.ircc_news for select
  using (true);
