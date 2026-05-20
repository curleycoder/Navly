-- Track which ircc_news items have been emailed to users.
-- NULL means not yet notified; a timestamp means the digest was sent.

alter table public.ircc_news
  add column if not exists notified_at timestamptz default null;

-- Index so the cron query for un-notified items is fast.
create index if not exists ircc_news_notified_at_idx
  on public.ircc_news (notified_at)
  where notified_at is null;
