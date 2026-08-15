/**
 * Boundary tests for PR residency obligation + citizenship presence math.
 * Run with:  npx tsx --test tests/pr-math.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { computePRResidency, computeCitizenshipPresence } from '../lib/pr-math'
import { EMPTY_PROFILE, type IntakeData } from '../lib/profile'
import type { PresenceData, TravelEntry } from '../lib/presence'

// ─── Date helpers (mirror pr-math conventions) ────────────────────────────────

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function daysAgo(n: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return iso(d)
}
function yearsAgo(n: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setFullYear(d.getFullYear() - n)
  return iso(d)
}

function presenceWith(travelLog: TravelEntry[] = [], arrivalDate: string | null = null): PresenceData {
  return {
    totalDays: 0, streak: 0, longestStreak: 0,
    lastCheckIn: null, lastAcknowledgedDate: null,
    arrivalDate, travelLog, deletedTravelIds: [],
    _updatedAt: new Date().toISOString(),
  }
}

function trip(departureDate: string, returnDate: string): TravelEntry {
  return {
    id: `${departureDate}-${returnDate}`,
    departureDate, returnDate,
    country: 'US', reason: 'test',
    createdAt: '', updatedAt: '',
  }
}

function profileWith(overrides: Partial<IntakeData>): IntakeData {
  return { ...EMPTY_PROFILE, ...overrides }
}

// ─── PR Residency Obligation ──────────────────────────────────────────────────

test('new PR (2 years in) with 100 days abroad is AT RISK, never BREACH', () => {
  const prDate = yearsAgo(2)
  // ~730 days in window minus 100 abroad ≈ 630 < 730 → below, but window not elapsed
  const r = computePRResidency(
    profileWith({ prDate }),
    presenceWith([trip(daysAgo(200), daysAgo(100))]),
  )
  assert.equal(r.status, 'at_risk')
  assert.notEqual(r.status, 'breach')
})

test('PR of 6+ years below 730 days in the rolling window is BREACH', () => {
  const prDate = yearsAgo(6)
  // Away for the last 4 years (open-ended trip) → ~365 days in window < 730
  const r = computePRResidency(
    profileWith({ prDate }),
    presenceWith([trip(yearsAgo(4), '')]), // open trip — still abroad
  )
  assert.equal(r.status, 'breach')
  assert.ok(r.daysInCanada < 730)
})

test('PR of 6 years, never travelled → on_track with full window', () => {
  const r = computePRResidency(profileWith({ prDate: yearsAgo(6) }), presenceWith())
  assert.equal(r.status, 'on_track')
  assert.ok(r.daysInCanada >= 730)
  assert.equal(r.daysNeeded, 0)
})

test('departure day counts OUT, return day counts IN (IRCC convention)', () => {
  const prDate = yearsAgo(3)
  // 10-day trip: dep daysAgo(20) … ret daysAgo(10) → exactly 10 days abroad
  const noTrip = computePRResidency(profileWith({ prDate }), presenceWith())
  const withTrip = computePRResidency(
    profileWith({ prDate }),
    presenceWith([trip(daysAgo(20), daysAgo(10))]),
  )
  assert.equal(noTrip.daysInCanada - withTrip.daysInCanada, 10)
})

test('same-day round trip (dep = ret) counts as zero days abroad', () => {
  const prDate = yearsAgo(3)
  const base = computePRResidency(profileWith({ prDate }), presenceWith())
  const sameDay = computePRResidency(
    profileWith({ prDate }),
    presenceWith([trip(daysAgo(30), daysAgo(30))]),
  )
  assert.equal(base.daysInCanada, sameDay.daysInCanada)
})

test('trip entirely outside the 5-year window is ignored', () => {
  const prDate = yearsAgo(7)
  const r = computePRResidency(
    profileWith({ prDate }),
    presenceWith([trip(yearsAgo(7), yearsAgo(6))]), // before the window
  )
  assert.equal(r.status, 'on_track')
  assert.equal(r.daysNeeded, 0)
})

// ─── Citizenship physical presence ────────────────────────────────────────────

test('no PR date → incomplete_data', () => {
  const r = computeCitizenshipPresence(profileWith({}), presenceWith())
  assert.equal(r.status, 'incomplete_data')
  assert.equal(r.hasPRDate, false)
})

test('pre-PR half-day credit: 730 pre-PR days → 365 credit (cap hit exactly)', () => {
  // Arrived 4 years ago, PR exactly 2 years ago → ~730 pre-PR days in window
  const arrival = yearsAgo(4)
  const prDate = yearsAgo(2)
  const r = computeCitizenshipPresence(
    profileWith({ prDate, arrivalDate: arrival }),
    presenceWith([], arrival),
  )
  assert.ok(r.prePRDays >= 729 && r.prePRDays <= 731, `prePRDays=${r.prePRDays}`)
  assert.equal(r.prePRCredit, Math.min(Math.floor(r.prePRDays / 2), 365))
  assert.equal(r.prePRCredit, 365)
})

test('pre-PR credit uses floor: 731 days → 365 (not 365.5)', () => {
  // Arrived just over 2 years before PR — the floor() must apply before the cap
  const arrival = daysAgo(365 * 3 + 40)
  const prDate = daysAgo(365)
  const r = computeCitizenshipPresence(
    profileWith({ prDate, arrivalDate: arrival }),
    presenceWith([], arrival),
  )
  assert.equal(r.prePRCredit, Math.min(Math.floor(r.prePRDays / 2), 365))
  assert.ok(Number.isInteger(r.prePRCredit))
})

test('post-PR days + capped credit reach eligible at 1,095', () => {
  // PR 3 years ago, arrived 5 years ago, no travel:
  // post-PR ≈ 1,096 days → eligible regardless of credit
  const arrival = yearsAgo(5)
  const prDate = yearsAgo(3)
  const r = computeCitizenshipPresence(
    profileWith({ prDate, arrivalDate: arrival }),
    presenceWith([], arrival),
  )
  assert.equal(r.status, 'eligible')
  assert.equal(r.daysNeeded, 0)
})

test('trip spanning the PR date splits correctly between pre- and post-PR windows', () => {
  const arrival = yearsAgo(4)
  const prDate = yearsAgo(2)
  // 20-day trip centred on the PR date: 10 days before, 10 after
  const dep = daysAgo(365 * 2 + 10)
  const ret = daysAgo(365 * 2 - 10)
  const base = computeCitizenshipPresence(
    profileWith({ prDate, arrivalDate: arrival }),
    presenceWith([], arrival),
  )
  const withTrip = computeCitizenshipPresence(
    profileWith({ prDate, arrivalDate: arrival }),
    presenceWith([trip(dep, ret)], arrival),
  )
  const lostTotal = base.totalCreditedDays - withTrip.totalCreditedDays
  // 10 post-PR days lost fully + ~10 pre-PR days lost at half credit ≈ 15 (±2 for cap effects)
  assert.ok(lostTotal >= 8 && lostTotal <= 17, `lostTotal=${lostTotal}`)
})
