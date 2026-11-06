import type { IntakeData } from '@/lib/profile'

export type StepId =
  | 'goal-first'       // "What do you need help with today?"
  | 'location-split'   // "Are you in Canada?"
  | 'inside-status'    // current status (inside Canada)
  | 'planned-entry'    // planned route (outside Canada)
  | 'key-date'         // one key date relevant to their situation
  | 'quick-crs'        // age + education + CLB + work → rough CRS estimate
  | 'early-signup'     // CRS/plan reveal + account creation, on one screen

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

  // ── Step 5: quick CRS inputs (age, education, CLB, work) — skip for PR ──────
  if (data.status !== 'pr') {
    steps.push('quick-crs')
  }

  // ── Step 6: plan reveal (CRS estimate) + account creation, one screen ───────
  steps.push('early-signup')

  return steps
}

export const stepTitles: Record<StepId, string> = {
  'goal-first':     'Your goal',
  'location-split': 'Your location',
  'inside-status':  'Your status',
  'planned-entry':  'Your plan',
  'key-date':       'Key date',
  'quick-crs':      'Score check',
  'early-signup':   'Your plan',
}