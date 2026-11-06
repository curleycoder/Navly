# Navly Analytics Reference

**Provider:** PostHog
**Helper:** `lib/analytics.ts` — all event names are typed as `AnalyticsEvent`, all properties typed as `AnalyticsProps`
**User identification:** Supabase auth `user.id` only. No email, name, phone, permit dates, CRS score, or immigration data is sent to PostHog.

---

## Privacy rules (non-negotiable)

- Only anonymous product-use events
- No PII: no names, emails, phone numbers
- No immigration specifics: no permit/expiry dates, CRS score, travel destinations, AI chat content, risk flags
- Users identified only by Supabase UID via `identify(user.id)`

---

## Event catalogue

### Onboarding funnel

| Event | Fired when | Source file |
|---|---|---|
| `onboarding_started` | IntakeFlow mounts | `IntakeFlow.tsx` |
| `onboarding_goal_selected` | User continues past goal-first step | `IntakeFlow.tsx` |
| `onboarding_location_selected` | User continues past location-split step | `IntakeFlow.tsx` |
| `onboarding_status_selected` | User continues past inside-status or planned-entry step | `IntakeFlow.tsx` |
| `onboarding_key_date_added` | User continues past key-date step with a date entered | `IntakeFlow.tsx` |
| `onboarding_completed` | Account created and flow reaches done state | `IntakeFlow.tsx` |
| `account_created` | Supabase signup succeeds | `SignUpStep.tsx` |

### Dashboard & general

| Event | Fired when | Source file |
|---|---|---|
| `dashboard_viewed` | Dashboard page loads | `app/dashboard/page.tsx` |
| `app_opened` | Dashboard page loads (session start proxy) | `app/dashboard/page.tsx` |

### Dates & deadlines

| Event | Fired when | Source file |
|---|---|---|
| `dates_page_viewed` | Important Dates page loads | `app/dashboard/dates/page.tsx` |
| `deadline_added` | (reserved — fire when user manually adds a date) | — |
| `deadline_updated` | (reserved — fire when user edits a date) | — |

### Travel log

| Event | Fired when | Source file |
|---|---|---|
| `travel_log_added` | User saves a new trip | `app/dashboard/days/page.tsx` |
| `travel_log_deleted` | User removes a trip | `app/dashboard/days/page.tsx` |
| `travel_log_updated` | (reserved — fire if edit flow is added) | — |

### Trackers

| Event | Fired when | Source file |
|---|---|---|
| `citizenship_tracker_viewed` | Citizenship page loads | `app/dashboard/citizenship/page.tsx` |
| `residency_tracker_viewed` | PR Residency page loads | `app/dashboard/residency/page.tsx` |

### Reminders

| Event | Fired when | Source file |
|---|---|---|
| `reminders_enabled` | User explicitly toggles on email reminders | `app/dashboard/dates/page.tsx` |
| `reminder_email_sent` | (reserved — fire from cron route after Brevo send) | `app/api/cron/reminders/route.ts` |

---

## Properties

All events accept these optional properties. Never add properties outside this list.

```ts
{
  source?: 'onboarding' | 'profile' | 'dates_page'
  status_type?: 'work_permit' | 'study_permit' | 'pr' | 'visitor' | 'unknown'
  goal?: 'deadlines' | 'pr_planning' | 'citizenship' | 'pr_residency' | 'explore'
  authenticated?: boolean
  step?: 'goal' | 'location' | 'status' | 'key_date' | 'quick_crs' | 'signup'
  reminder_channel?: 'email'
}
```

`status_type` and `goal` use safe buckets — never raw permit types or dates.

---

## The 5 PostHog dashboards to build

### 1. Onboarding funnel

Steps: `onboarding_started → onboarding_goal_selected → onboarding_status_selected → onboarding_key_date_added → onboarding_completed → account_created`

The plan reveal (CRS estimate, deadlines) and the signup form are one screen — `account_created` fires when Supabase signup succeeds, and `onboarding_completed` fires right after, once the profile is saved and the flow reaches its final step.

**Primary question:** Of everyone who starts onboarding, what % saves one key date?
**Target:** 55% select a goal, 40% add a key date, 35% reach `onboarding_completed`.

### 2. Core value funnel (activation)

Steps: `account_created → deadline_added → reminders_enabled → travel_log_added → app_opened (again)`

**Primary question:** What % of new accounts add one deadline in their first session?
**Target:** 60%+.

### 3. Day-7 retention

First event: `account_created`. Return event: `app_opened` or `dashboard_viewed`. Window: day 7.

**Primary question:** Which first action (added deadline / added travel / viewed tracker) best predicts day-7 return?

### 4. Feature adoption

Weekly breakdown of % of active users who:
- Added at least one deadline
- Enabled reminders
- Added travel history
- Opened citizenship tracker
- Opened PR residency tracker
- Updated a date (signals trust as source of truth)

### 5. Drop-off by onboarding step

Use `step` property on `onboarding_goal_selected`, `onboarding_location_selected`, `onboarding_status_selected`, `onboarding_key_date_added` to build a step-by-step funnel and identify where users leave.

---

## Setup checklist

- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` to `.env.local` and Netlify env vars
- [ ] Add `NEXT_PUBLIC_POSTHOG_HOST` (default `https://us.i.posthog.com`) if using EU region
- [ ] Create the 5 dashboards above in PostHog
- [ ] Set up a "Day 7 retention" cohort in PostHog Retention report
- [ ] Add `reminder_email_sent` to the cron route after each successful Brevo send
