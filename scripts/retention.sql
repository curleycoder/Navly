-- Navly retention check — paste into Supabase Studio > SQL Editor.
--
-- The question this answers: does anyone actually COME BACK to the days tracker?
--
-- NOTE: presence_logs.date is the day being logged (users can backfill months
-- at once). created_at is when they actually used the app. Retention must be
-- measured on created_at, never on date.

-- ─── 1. The headline funnel ──────────────────────────────────────────────────
select
  (select count(*) from auth.users)                                as signups,
  (select count(*) from profiles)                                  as completed_profile,
  (select count(distinct user_id) from presence_logs)              as tracked_at_least_once,
  (select count(*) from (
      select user_id
      from presence_logs
      group by user_id
      having count(distinct created_at::date) >= 2
   ) t)                                                            as came_back_2plus_days,
  (select count(*) from (
      select user_id
      from presence_logs
      group by user_id
      having count(distinct created_at::date) >= 5
   ) t)                                                            as came_back_5plus_days,
  (select count(distinct user_id) from presence_logs
     where created_at > now() - interval '7 days')                 as active_last_7d,
  (select count(distinct user_id) from presence_logs
     where created_at > now() - interval '30 days')                as active_last_30d;

-- ─── 2. How many separate days did each user come back? ──────────────────────
-- If almost everyone sits in the "1" bucket, the tracker is not sticky yet.
select
  case
    when d = 1        then '1 day (tried once)'
    when d between 2 and 4  then '2-4 days'
    when d between 5 and 9  then '5-9 days'
    when d between 10 and 29 then '10-29 days'
    else '30+ days (real habit)'
  end                              as usage_bucket,
  count(*)                         as users
from (
  select user_id, count(distinct created_at::date) as d
  from presence_logs
  group by user_id
) x
group by 1
order by min(d);

-- ─── 3. Are signups still growing, and do they convert to tracking? ──────────
select
  date_trunc('week', u.created_at)::date            as week,
  count(*)                                          as signups,
  count(*) filter (where p.user_id is not null)     as started_tracking
from auth.users u
left join (select distinct user_id from presence_logs) p on p.user_id = u.id
group by 1
order by 1 desc
limit 12;

-- ─── 4. Longest streaks — your best users ────────────────────────────────────
select streak, longest_streak, last_checkin
from presence_streaks
order by longest_streak desc
limit 20;

-- ─── 5. Anyone paying? ───────────────────────────────────────────────────────
select status, count(*) from subscriptions group by 1 order by 2 desc;
