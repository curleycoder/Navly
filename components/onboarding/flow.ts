import type { IntakeData } from '@/lib/profile'

export type StepId =
  // ── Short initial onboarding (5 steps) ───────────────────────────────────────
  | 'goal-first'       // "What do you need help with today?"
  | 'location-split'   // "Are you in Canada?"
  | 'inside-status'    // current status (inside Canada)
  | 'planned-entry'    // planned route (outside Canada)
  | 'key-date'         // one key date relevant to their situation
  | 'plan-preview'     // personalized value reveal before account creation
  | 'early-signup'     // account creation
  // ── Progressive profile completion (not shown in initial onboarding) ─────────
  | 'goal'
  | 'province'
  | 'personal'
  | 'canada-dates'
  | 'pr-status'
  | 'spouse-language'
  | 'language'
  | 'education'
  | 'work'
  | 'settlement'
  | 'pnp-details'
  | 'manitoba-family'
  | 'risk'
  | 'contact-phone'

// STATUS VALUES THAT NEED A KEY DATE
const KEY_DATE_STATUSES = new Set([
  'work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit',
  'student', 'visitor', 'pr',
])

export function getSteps(data: IntakeData): StepId[] {
  // ── Step 1: goal-first ───────────────────────────────────────────────────────
  const steps: StepId[] = ['goal-first']
  if (!data.primaryUse) return steps

  // ── Step 2: location ─────────────────────────────────────────────────────────
  steps.push('location-split')
  if (!data.locationStatus) return steps

  const isInside = data.locationStatus === 'inside'

  // ── Step 3: status ───────────────────────────────────────────────────────────
  if (isInside) {
    steps.push('inside-status')
    if (!data.status) return steps
  } else {
    steps.push('planned-entry')
    if (!data.plannedEntry) return steps
  }

  // ── Step 4: one key date (inside users only, skip for outside and 'other') ───
  if (isInside && KEY_DATE_STATUSES.has(data.status)) {
    steps.push('key-date')
  }

  // ── Step 5: plan preview → account creation ──────────────────────────────────
  steps.push('plan-preview', 'early-signup')

  return steps
}

export const stepTitles: Record<StepId, string> = {
  'goal-first': 'Your goal',
  'location-split': 'Your location',
  'inside-status': 'Your status',
  'planned-entry': 'Your plan',
  'key-date': 'Key date',
  'plan-preview': 'Your plan',
  'early-signup': 'Save your plan',
  // Progressive steps (used in future profile completion flows)
  goal: 'Your goal',
  province: 'Province',
  personal: 'Basic details',
  'canada-dates': 'Canada dates',
  'pr-status': 'PR details',
  'spouse-language': 'Spouse details',
  language: 'Language',
  education: 'Education',
  work: 'Work experience',
  settlement: 'Settlement funds',
  'pnp-details': 'Provincial ties',
  'manitoba-family': 'Family in Manitoba',
  risk: 'Background check',
  'contact-phone': 'Get updates',
}