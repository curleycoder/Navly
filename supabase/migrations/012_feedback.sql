-- Migration 012: In-app beta feedback
-- Captures the moment a user is confused, instead of losing them silently.
-- Written exclusively by /api/feedback using the service role key.

create table if not exists public.feedback (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete set null,
  email      text,
  category   text        not null default 'other'
               check (category in ('bug', 'confusing', 'wrong_info', 'idea', 'other')),
  message    text        not null,
  page       text,                   -- pathname where feedback was opened
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

create index if not exists feedback_category_idx
  on public.feedback (category);

alter table public.feedback enable row level security;
-- No user-level policy — the API route (service role) is the only writer,
-- and only you read it from the Supabase dashboard.
