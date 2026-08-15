-- Migration 010: Security hardening
-- Run against production after deploying the corresponding code changes.

-- ─── subscriptions: add expires_at and stripe_subscription_id ────────────────
-- expires_at: set by the webhook on invoice.paid / subscription.updated.
--   NULL = no expiry tracked yet (active until canceled).
--   When set, the client checks it against the current date.
-- stripe_subscription_id: needed so invoice/subscription events can find the row.

alter table public.subscriptions
  add column if not exists expires_at           timestamptz,
  add column if not exists stripe_subscription_id text;

create index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ─── chat_rate_limits ────────────────────────────────────────────────────────
-- One row per user. Tracks the current 60-second sliding window.
-- Written exclusively by the /api/chat server route using the service role key.
-- Users can read their own row; they cannot write to it.

create table if not exists public.chat_rate_limits (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null default now(),
  count        integer     not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.chat_rate_limits enable row level security;

create policy "Users can read their own rate limit"
  on public.chat_rate_limits for select
  using (auth.uid() = user_id);

-- Service role (chat API) writes bypass RLS — no insert/update policy for users.

-- ─── account_deletion_requests ───────────────────────────────────────────────
-- Soft-deletion log for PIPEDA audit trail.
-- Written by /api/auth/delete-account immediately before hard-deleting the user.
-- The actual user row (and all cascaded data) is deleted by the API route;
-- this table is the paper trail that the request was received and processed.
-- No RLS needed — only service role touches this table.

create table if not exists public.account_deletion_requests (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null,   -- NOT a FK — user row will be gone after deletion
  email        text,                   -- stored for audit; user row gone afterwards
  requested_at timestamptz not null default now(),
  completed_at timestamptz             -- set after auth.admin.deleteUser succeeds
);

alter table public.account_deletion_requests enable row level security;
-- No user-level policy — service role only.
