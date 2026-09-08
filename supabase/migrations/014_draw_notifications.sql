-- Dedup table for Express Entry draw alert emails.
--
-- One row per (user, draw). The unique constraint is what guarantees a user is
-- never emailed twice about the same round, even if the sync cron runs again or
-- retries after a partial failure.

create table if not exists public.draw_notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  draw_number integer not null,
  sent_at     timestamptz not null default now(),
  unique (user_id, draw_number)
);

create index if not exists draw_notifications_user_idx
  on public.draw_notifications(user_id, draw_number);

alter table public.draw_notifications enable row level security;

-- Users may see which alerts they were sent. Writes are cron-only (service role).
create policy "Users can read their own draw notifications"
  on public.draw_notifications for select
  using (auth.uid() = user_id);
