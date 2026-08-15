-- Migration 011: Subscription integrity + deletion audit notes
-- Run BEFORE deploying the webhook onConflict change.

-- ─── 1. Dedupe existing subscription rows ────────────────────────────────────
-- Stripe webhook retries could have inserted duplicate (user_id, plan) rows
-- (upsert without a conflict target inserts on the `id` PK every time).
-- Keep the newest row per (user_id, plan), delete the rest.

delete from public.subscriptions s
using public.subscriptions newer
where s.user_id = newer.user_id
  and s.plan    = newer.plan
  and s.created_at < newer.created_at;

-- ─── 2. Unique constraint so upsert(onConflict: 'user_id,plan') works ────────

create unique index if not exists subscriptions_user_plan_key
  on public.subscriptions (user_id, plan);

-- ─── 3. Audit notes for account deletion (e.g. Stripe cancel failures) ───────

alter table public.account_deletion_requests
  add column if not exists notes text;
