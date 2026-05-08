-- Navly — initial schema
-- Run once against a fresh Supabase project.
-- All tables use Supabase Auth (auth.users) as the user source.
-- Row Level Security (RLS) is enabled on every user-owned table.

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Stores the full IntakeData JSON blob for each user.
-- Supabase Auth user id is the primary key (1-to-1 with auth.users).

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  profile_data jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can upsert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ─── subscriptions ───────────────────────────────────────────────────────────
-- Written by the Stripe webhook (service role key, bypasses RLS on write).
-- Users can read their own subscription.

create table if not exists subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  plan                text not null check (plan in ('report', 'tracker')),
  status              text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  stripe_session_id   text,
  stripe_customer_id  text,
  stripe_subscription_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);

alter table subscriptions enable row level security;

create policy "Users can read their own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Service role (webhook) writes bypass RLS — no insert/update policy needed for users.

-- ─── consultants ─────────────────────────────────────────────────────────────
-- Managed by the admin panel. Publicly readable for active listings.

create table if not exists consultants (
  id                 uuid primary key default uuid_generate_v4(),
  name               text not null,
  business_name      text not null default '',
  agency_code        text not null default '',
  certification_type text not null default 'RCIC' check (certification_type in ('RCIC', 'Lawyer', 'Paralegal', 'Other')),
  license_number     text not null default '',
  city               text not null default '',
  province           text not null default '',
  languages          text[] not null default '{}',
  services           text[] not null default '{}',
  booking_link       text not null default '',
  contact_email      text not null default '',
  avatar_url         text not null default '',
  sponsored          boolean not null default false,
  verified           boolean not null default false,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table consultants enable row level security;

create policy "Anyone can read active consultants"
  on consultants for select
  using (active = true);

-- Admin writes via service role key — no user-level insert/update policy.

-- ─── ircc_news ───────────────────────────────────────────────────────────────
-- Populated by the /api/cron/news endpoint. Publicly readable.

create table if not exists ircc_news (
  id             text primary key,   -- GUID or URL from RSS feed
  title          text not null,
  summary        text not null default '',
  source_url     text not null,
  source_name    text not null default 'IRCC',
  published_at   timestamptz not null,
  category       text not null default 'general',
  importance     text not null default 'low' check (importance in ('high', 'medium', 'low')),
  affected_users text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create index if not exists ircc_news_published_at_idx on ircc_news(published_at desc);
create index if not exists ircc_news_category_idx on ircc_news(category);

alter table ircc_news enable row level security;

create policy "Anyone can read news"
  on ircc_news for select
  using (true);

-- ─── presence_logs ───────────────────────────────────────────────────────────
-- One row per user per date when they confirm they were in Canada.
-- Used by the Canada days tracker and reminders cron.

create table if not exists presence_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  status     text not null default 'inside' check (status in ('inside', 'outside', 'uncertain')),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists presence_logs_user_date_idx on presence_logs(user_id, date desc);

alter table presence_logs enable row level security;

create policy "Users can read their own presence logs"
  on presence_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own presence logs"
  on presence_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presence logs"
  on presence_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own presence logs"
  on presence_logs for delete
  using (auth.uid() = user_id);

-- ─── presence_streaks ────────────────────────────────────────────────────────
-- Cached streak counters — updated by the client or a trigger.
-- The reminders cron reads this to personalise check-in email subject lines.

create table if not exists presence_streaks (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  streak         integer not null default 0,
  longest_streak integer not null default 0,
  last_checkin   date,
  updated_at     timestamptz not null default now()
);

alter table presence_streaks enable row level security;

create policy "Users can read their own streak"
  on presence_streaks for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own streak"
  on presence_streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own streak"
  on presence_streaks for update
  using (auth.uid() = user_id);

-- ─── Helper: updated_at trigger ──────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger set_subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

create trigger set_consultants_updated_at
  before update on consultants
  for each row execute function set_updated_at();

create trigger set_presence_streaks_updated_at
  before update on presence_streaks
  for each row execute function set_updated_at();
