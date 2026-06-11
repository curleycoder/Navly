-- ─── partner_listings ────────────────────────────────────────────────────────
-- Newcomer Essentials ad slots on the dashboard.
-- Public read on active rows. Service-role write only.

create table if not exists public.partner_listings (
  id             uuid        primary key default gen_random_uuid(),
  category       text        not null,  -- 'banking' | 'phone' | 'housing' | 'money_transfer' | 'language'
  name           text        not null,
  headline       text        not null,
  logo_url       text,
  cta_text       text        not null default 'Learn more',
  cta_url        text        not null,
  provinces      text[]      not null default '{}',  -- empty = show everywhere
  sponsored      boolean     not null default false,
  active         boolean     not null default true,
  display_order  int         not null default 0,
  created_at     timestamptz not null default now()
);

-- RLS
alter table public.partner_listings enable row level security;

create policy "Public can read active partner listings"
  on public.partner_listings for select
  using (active = true);

-- Indexes
create index if not exists partner_listings_category_idx on public.partner_listings (category);
create index if not exists partner_listings_active_idx   on public.partner_listings (active);

-- ─── Seed data ────────────────────────────────────────────────────────────────

insert into public.partner_listings
  (category, name, headline, logo_url, cta_text, cta_url, provinces, sponsored, active, display_order)
values
  (
    'banking',
    'TD Newcomer Account',
    'No monthly fees for 1 year — open your first Canadian bank account',
    'https://logo.clearbit.com/td.com',
    'Open account',
    'https://www.td.com/ca/en/personal-banking/products/bank-accounts/newcomers-to-canada/',
    '{}', true, true, 10
  ),
  (
    'banking',
    'RBC Newcomer Advantage',
    'Free chequing for 12 months + free international money transfer',
    'https://logo.clearbit.com/rbcroyalbank.com',
    'Get started',
    'https://www.rbcroyalbank.com/newcomers/',
    '{}', true, true, 20
  ),
  (
    'phone',
    'Koodo Mobile',
    'Flexible prepaid and monthly plans — no contract required',
    'https://logo.clearbit.com/koodomobile.com',
    'See plans',
    'https://www.koodomobile.com/',
    '{}', false, true, 30
  ),
  (
    'money_transfer',
    'Wise',
    'Send money home with real exchange rates and low fees',
    'https://logo.clearbit.com/wise.com',
    'Send money',
    'https://wise.com/ca/',
    '{}', false, true, 40
  ),
  (
    'housing',
    'Rentals.ca',
    'Find apartments and houses for rent across Canada',
    'https://logo.clearbit.com/rentals.ca',
    'Browse listings',
    'https://www.rentals.ca/',
    '{}', false, true, 50
  );
