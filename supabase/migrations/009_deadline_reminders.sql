-- Navly — deadline reminder delivery history
-- Prevents duplicate emails across cron runs and threshold windows.
--
-- Unique key: (user_id, deadline_id, deadline_date, threshold_days)
-- Including deadline_date ensures that if a user updates their permit expiry,
-- reminders for the new date fire correctly — old records for the previous
-- date do not block them.
--
-- deadline_id     matches Deadline.id from lib/deadlines.ts (e.g. 'work_permit')
-- deadline_date   the YYYY-MM-DD date value of the deadline when the email was sent
-- threshold_days  one of ALERT_DAYS [180, 120, 90, 60, 30, 7], or 0 for expired

create table if not exists public.deadline_reminders (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  deadline_id    text        not null,
  deadline_date  date        not null,
  threshold_days int         not null,
  sent_at        timestamptz not null default now(),

  unique (user_id, deadline_id, deadline_date, threshold_days)
);

create index if not exists deadline_reminders_user_idx
  on public.deadline_reminders (user_id);

alter table public.deadline_reminders enable row level security;
-- All reads and writes go through service role only — no user-level policy needed.
