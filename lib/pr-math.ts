/**
 * PR Residency and Citizenship physical-presence calculations.
 *
 * These are ESTIMATES based on user-entered data.
 * Final calculations depend on official IRCC records and professional review.
 *
 * PR Residency Obligation — IRCC rule:
 *   Must be physically present in Canada for at least 730 days
 *   in ANY given 5-year period.
 *   Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/understand-pr-status/is-pr-status-valid.html
 *
 * Citizenship Physical Presence — IRCC rule:
 *   Must be physically present in Canada for at least 1,095 days
 *   in the 5 years immediately before the date of your citizenship application.
 *   Days in Canada as a temporary resident or protected person before becoming PR
 *   count as a half-day each, up to a maximum credit of 365 days.
 *   Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/already-pr.html
 */

import type { IntakeData } from './profile'
import type { PresenceData, TravelEntry } from './presence'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Inclusive count of calendar days between two YYYY-MM-DD strings.
function inclusiveDays(start: string, end: string): number {
  if (end < start) return 0
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')
  return Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1
}

// Add N years to a YYYY-MM-DD string.
function addYears(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setFullYear(d.getFullYear() + n)
  return d.toISOString().slice(0, 10)
}

// Add N days to a YYYY-MM-DD string.
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function clamp(dateStr: string, min: string, max: string): string {
  if (dateStr < min) return min
  if (dateStr > max) return max
  return dateStr
}

// ─── Travel overlap ───────────────────────────────────────────────────────────

// Days spent OUTSIDE Canada from travelLog that overlap [windowStart, windowEnd] (both inclusive).
// Departure day is counted as OUT; return day is counted as IN (matches presence.ts convention).
function abroadDaysInWindow(
  travelLog: TravelEntry[],
  windowStart: string,
  windowEnd: string,
): number {
  return travelLog.reduce((sum, entry) => {
    if (!entry.departureDate) return sum
    const dep = entry.departureDate
    const ret = entry.returnDate || windowEnd // open trip: count as still away

    // The "abroad" interval is [dep, ret) — return day is IN Canada
    const abroadStart = clamp(dep, windowStart, windowEnd)
    const abroadEnd   = clamp(ret, windowStart, windowEnd)

    if (abroadEnd <= abroadStart) return sum
    // Days from abroadStart up to (but not including) abroadEnd
    const s = new Date(abroadStart + 'T12:00:00')
    const e = new Date(abroadEnd   + 'T12:00:00')
    const days = Math.floor((e.getTime() - s.getTime()) / 86_400_000)
    return sum + Math.max(0, days)
  }, 0)
}

// ─── PR Residency Obligation ──────────────────────────────────────────────────

export type PRResidencyStatus = 'on_track' | 'at_risk' | 'breach'

export type PRResidencyResult = {
  /** Days physically in Canada within the active 5-year rolling window */
  daysInCanada: number
  /** Always 730 */
  daysRequired: number
  /** How many more days needed (0 if already meeting requirement) */
  daysNeeded: number
  /** Extra days above the 730 threshold (cushion) */
  daysBuffer: number
  /** Start of the counting window */
  windowStart: string
  /** Today (end of the counting window) */
  windowEnd: string
  /** on_track = meets 730; at_risk = below 730 with PR < 5 years; breach = below 730 with full 5-year window elapsed */
  status: PRResidencyStatus
  /** Estimated date when user will hit 730 days (assuming no future travel) — null if already met */
  estimatedMeetDate: string | null
  /** Whether the user entered a PR date */
  hasPRDate: boolean
}

export function computePRResidency(
  profile: IntakeData,
  presence: PresenceData,
): PRResidencyResult {
  const today = todayStr()
  const fiveYearsAgo = addYears(today, -5)
  const prDate = profile.prDate || null
  const hasPRDate = !!prDate
  const arrivalDate = presence.arrivalDate || profile.arrivalDate || null

  // Window: starts from the later of (PR date or arrival date) and 5 years ago
  const earliestStart = prDate ?? arrivalDate ?? today
  const windowStart = earliestStart > fiveYearsAgo ? earliestStart : fiveYearsAgo
  const windowEnd = today

  const totalDaysInWindow = inclusiveDays(windowStart, windowEnd)
  const abroad = abroadDaysInWindow(presence.travelLog, windowStart, windowEnd)
  const daysInCanada = Math.max(0, totalDaysInWindow - abroad)

  const daysRequired = 730
  const daysNeeded = Math.max(0, daysRequired - daysInCanada)
  const daysBuffer = Math.max(0, daysInCanada - daysRequired)

  // Status
  const windowIsFullFiveYears = !prDate || prDate <= fiveYearsAgo
  let status: PRResidencyStatus
  if (daysInCanada >= daysRequired) {
    status = 'on_track'
  } else if (windowIsFullFiveYears) {
    // The full 5-year window has elapsed and they still haven't met 730 — breach
    status = 'breach'
  } else {
    status = 'at_risk'
  }

  // Estimated date to reach 730 (assuming staying in Canada every day from today)
  const estimatedMeetDate = daysInCanada >= daysRequired
    ? null
    : addDays(today, daysNeeded)

  return {
    daysInCanada,
    daysRequired,
    daysNeeded,
    daysBuffer,
    windowStart,
    windowEnd,
    status,
    estimatedMeetDate,
    hasPRDate,
  }
}

// ─── Citizenship Physical Presence ────────────────────────────────────────────

export type CitizenshipStatus = 'eligible' | 'on_track' | 'needs_more_time' | 'incomplete_data'

export type CitizenshipResult = {
  /** Days in Canada as PR (or after PR date) in the 5-year window */
  postPRDays: number
  /** Days in Canada as temp resident before PR date in the 5-year window */
  prePRDays: number
  /** Half-day credit for pre-PR days, capped at 365 */
  prePRCredit: number
  /** postPRDays + prePRCredit */
  totalCreditedDays: number
  /** Always 1,095 */
  daysRequired: number
  /** How many more credited days needed */
  daysNeeded: number
  /** Percentage complete (totalCreditedDays / 1095) */
  pctComplete: number
  /** Estimated date of eligibility assuming no future travel and no pre-PR credit change */
  estimatedEligibilityDate: string | null
  status: CitizenshipStatus
  /** Whether the user entered a PR date (required for accurate calculation) */
  hasPRDate: boolean
}

export function computeCitizenshipPresence(
  profile: IntakeData,
  presence: PresenceData,
): CitizenshipResult {
  const today = todayStr()
  const fiveYearsAgo = addYears(today, -5)
  const prDate = profile.prDate || null
  const arrivalDate = presence.arrivalDate || profile.arrivalDate || null

  if (!prDate) {
    return {
      postPRDays: 0, prePRDays: 0, prePRCredit: 0,
      totalCreditedDays: 0, daysRequired: 1095, daysNeeded: 1095,
      pctComplete: 0, estimatedEligibilityDate: null,
      status: 'incomplete_data', hasPRDate: false,
    }
  }

  const daysRequired = 1095

  // ── Post-PR days ────────────────────────────────────────────────────────────
  // Count from the later of (PR date, 5 years ago) to today
  const postPRStart = prDate > fiveYearsAgo ? prDate : fiveYearsAgo
  const postPRTotalDays = inclusiveDays(postPRStart, today)
  const postPRAbroad = abroadDaysInWindow(presence.travelLog, postPRStart, today)
  const postPRDays = Math.max(0, postPRTotalDays - postPRAbroad)

  // ── Pre-PR days (half-day credit) ───────────────────────────────────────────
  // Count days in Canada as temp resident between (5 years ago or arrival) and (PR date - 1 day)
  let prePRDays = 0
  let prePRCredit = 0
  if (arrivalDate && arrivalDate < prDate) {
    const prePRStart = arrivalDate > fiveYearsAgo ? arrivalDate : fiveYearsAgo
    const prePREnd = addDays(prDate, -1) // day before PR date
    if (prePREnd >= prePRStart) {
      const prePRTotalDays = inclusiveDays(prePRStart, prePREnd)
      const prePRAbroad = abroadDaysInWindow(presence.travelLog, prePRStart, prePREnd)
      prePRDays = Math.max(0, prePRTotalDays - prePRAbroad)
      // Half-day credit, capped at 365
      prePRCredit = Math.min(Math.floor(prePRDays / 2), 365)
    }
  }

  const totalCreditedDays = postPRDays + prePRCredit
  const daysNeeded = Math.max(0, daysRequired - totalCreditedDays)
  const pctComplete = Math.min(100, Math.round((totalCreditedDays / daysRequired) * 100))

  // Estimated eligibility date (assuming staying in Canada, no future travel)
  const estimatedEligibilityDate = totalCreditedDays >= daysRequired
    ? null
    : addDays(today, daysNeeded)

  let status: CitizenshipStatus
  if (totalCreditedDays >= daysRequired) {
    status = 'eligible'
  } else if (pctComplete >= 50) {
    status = 'on_track'
  } else {
    status = 'needs_more_time'
  }

  return {
    postPRDays, prePRDays, prePRCredit,
    totalCreditedDays, daysRequired, daysNeeded,
    pctComplete, estimatedEligibilityDate,
    status, hasPRDate: true,
  }
}
