/**
 * Privacy-safe product analytics.
 *
 * Privacy rules:
 * - Anonymous product-use events only.
 * - No PII: no names, emails, or phone numbers.
 * - No immigration specifics: no permit dates, CRS scores, travel destinations,
 *   AI chat content, or immigration risk flags.
 * - Users are identified only by their Supabase auth user ID.
 */

import posthog from 'posthog-js'

// ─── Typed event catalogue ────────────────────────────────────────────────────

export type AnalyticsEvent =
  // Onboarding funnel
  | 'onboarding_started'
  | 'onboarding_goal_selected'
  | 'onboarding_location_selected'
  | 'onboarding_status_selected'
  | 'onboarding_key_date_added'
  | 'plan_preview_completed'   // user clicked "Save my plan" — committed before signup
  | 'onboarding_completed'     // user finished signup and landed on dashboard
  | 'onboarding_step_viewed'
  | 'onboarding_step_completed'
  // Plan preview CTAs
  | 'plan_cta_viewed'          // impression — fires when CTA renders (use for CTR denominator)
  | 'plan_cta_clicked'         // click — primary demand signal for the coming-soon feature
  // Account
  | 'account_created'
  // Dates & deadlines
  | 'deadline_added'
  | 'deadline_updated'
  | 'dates_page_viewed'
  // Travel log
  | 'travel_log_added'
  | 'travel_log_updated'
  | 'travel_log_deleted'
  // Reminders
  | 'reminders_enabled'
  | 'reminder_email_sent'
  // Trackers
  | 'citizenship_tracker_viewed'
  | 'residency_tracker_viewed'
  // General
  | 'app_opened'
  | 'dashboard_viewed'

// Safe-only properties — no PII, no dates, no immigration specifics
export type AnalyticsProps = {
  source?: 'onboarding' | 'profile' | 'dates_page'
  status_type?: 'work_permit' | 'study_permit' | 'pr' | 'visitor' | 'unknown'
  goal?: 'deadlines' | 'pr_planning' | 'citizenship' | 'pr_residency' | 'explore'
  authenticated?: boolean
  step?: 'goal' | 'location' | 'status' | 'key_date' | 'quick_crs' | 'save_plan' | 'signup'
  cta_variant?: 'low_score' | 'high_score'
  cta_type?: 'waitlist' | 'consultant' | 'connect'
  reminder_channel?: 'email'
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

/** Map internal status values to safe analytics buckets. */
export function toStatusType(status: string | undefined): AnalyticsProps['status_type'] {
  if (!status) return 'unknown'
  if (['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(status))
    return 'work_permit'
  if (status === 'student') return 'study_permit'
  if (status === 'pr') return 'pr'
  if (status === 'visitor') return 'visitor'
  return 'unknown'
}

/** Map primaryUse values to safe analytics goal buckets. */
export function toGoal(primaryUse: string | undefined): AnalyticsProps['goal'] | undefined {
  const map: Record<string, AnalyticsProps['goal']> = {
    deadlines: 'deadlines',
    pr: 'pr_planning',
    citizenship: 'citizenship',
    residency: 'pr_residency',
    explore: 'explore',
  }
  return primaryUse ? map[primaryUse] : undefined
}

// ─── Core functions ───────────────────────────────────────────────────────────

/** Fire an analytics event. No-op on the server or if PostHog is not initialised. */
export function track(event: AnalyticsEvent, props?: AnalyticsProps) {
  if (typeof window === 'undefined') return
  posthog.capture(event, props)
}

/**
 * Link all subsequent events to a Supabase user ID.
 * Call once after login or account creation.
 * Never pass email, name, or immigration data.
 */
export function identify(userId: string) {
  if (typeof window === 'undefined') return
  posthog.identify(userId)
}

/** Reset identity on sign-out. */
export function resetIdentity() {
  if (typeof window === 'undefined') return
  posthog.reset()
}
