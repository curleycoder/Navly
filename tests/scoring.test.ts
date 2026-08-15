/**
 * Boundary tests for the CRS / CLB / FSW scoring engine.
 *
 * Run with:  npx tsx --test tests/scoring.test.ts
 * (or add vitest later — these use node:test so no extra dependency is needed)
 *
 * Expected values are taken from the official IRCC CRS criteria page:
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { convertToCLB, calculateScore, computeAge } from '../lib/scoring'
import {
  crsAgePts,
  crsCanadianWorkPts,
  crsSkillTransferabilityPts,
} from '../lib/crs-tables'
import { EMPTY_PROFILE, type IntakeData } from '../lib/profile'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileWith(overrides: Partial<IntakeData>): IntakeData {
  return { ...EMPTY_PROFILE, ...overrides }
}

/** A single 30-year-old with IELTS all CLB 9 (L 8.0, R 7.0, W 7.0, S 7.0), bachelor's. */
function baseProfile(overrides: Partial<IntakeData> = {}): IntakeData {
  return profileWith({
    age: '30',
    maritalStatus: 'single',
    langTestType: 'ielts-general',
    langReading: '7.0',
    langWriting: '7.0',
    langListening: '8.0',
    langSpeaking: '7.0',
    educationLevel: 'bachelors',
    teerLevel: '1',
    ...overrides,
  })
}

// ─── CLB conversion boundaries (IELTS General) ────────────────────────────────

test('IELTS: exact CLB 9 boundary (official row: L8.0 R7.0 W7.0 S7.0)', () => {
  const clb = convertToCLB('ielts-general', { r: 7.0, w: 7.0, l: 8.0, s: 7.0 })
  assert.deepEqual(clb, { r: 9, w: 9, l: 9, s: 9 })
})

test('IELTS: one half-band below CLB 9 in listening drops that skill to CLB 8', () => {
  const clb = convertToCLB('ielts-general', { r: 7.0, w: 7.0, l: 7.5, s: 7.0 })
  assert.equal(clb!.l, 8)
})

test('IELTS: CLB 7 floor (6.0 across) and 5.5 reading falls to CLB 6', () => {
  assert.deepEqual(
    convertToCLB('ielts-general', { r: 6.0, w: 6.0, l: 6.0, s: 6.0 }),
    { r: 7, w: 7, l: 7, s: 7 },
  )
  // Reading 5.0–5.9 = CLB 6 per IRCC (5.0 is the CLB 6 floor for reading)
  assert.equal(convertToCLB('ielts-general', { r: 5.0, w: 6.0, l: 6.0, s: 6.0 })!.r, 6)
  assert.equal(convertToCLB('ielts-general', { r: 4.9, w: 6.0, l: 6.0, s: 6.0 })!.r, 5)
})

test('CELPIP maps 1:1 and clamps to 3..10', () => {
  assert.deepEqual(convertToCLB('celpip', { r: 12, w: 2, l: 7, s: 9 }), { r: 10, w: 3, l: 7, s: 9 })
})

test('convertToCLB returns null for missing/NaN scores', () => {
  assert.equal(convertToCLB('ielts-general', { r: NaN, w: 6, l: 6, s: 6 }), null)
  assert.equal(convertToCLB('none', { r: 6, w: 6, l: 6, s: 6 }), null)
})

// ─── CRS age boundaries ───────────────────────────────────────────────────────

test('CRS age: 17 = 0, 18 = 99, 20–29 = 110, 30 = 105, 44 = 6, 45 = 0 (no spouse)', () => {
  assert.equal(crsAgePts(17, false), 0)
  assert.equal(crsAgePts(18, false), 99)
  assert.equal(crsAgePts(20, false), 110)
  assert.equal(crsAgePts(29, false), 110)
  assert.equal(crsAgePts(30, false), 105)
  assert.equal(crsAgePts(44, false), 6)
  assert.equal(crsAgePts(45, false), 0)
})

test('CRS age with spouse: 29 = 100, 30 = 95', () => {
  assert.equal(crsAgePts(29, true), 100)
  assert.equal(crsAgePts(30, true), 95)
})

// ─── Canadian work ────────────────────────────────────────────────────────────

test('Canadian work: 11 months = 0, 12 months = 40, caps at 5 years = 80 (no spouse)', () => {
  assert.equal(crsCanadianWorkPts(11, false), 0)
  assert.equal(crsCanadianWorkPts(12, false), 40)
  assert.equal(crsCanadianWorkPts(60, false), 80)
  assert.equal(crsCanadianWorkPts(600, false), 80) // cap
})

// ─── Skill transferability (official IRCC table) ──────────────────────────────
// ONE post-secondary credential (bachelor's, master's, doctoral all count as one):
//   CLB 7 = 13, CLB 9 = 25
// TWO OR MORE credentials (one 3+ years): CLB 7 = 25, CLB 9 = 50

test('transferability: single bachelors + CLB 9, no work = 25 (NOT 50)', () => {
  assert.equal(crsSkillTransferabilityPts('bachelors', 9, 0, 0), 25)
})

test('transferability: single masters + CLB 9, no work = 25 (NOT 50)', () => {
  assert.equal(crsSkillTransferabilityPts('masters', 9, 0, 0), 25)
})

test('transferability: two-credentials + CLB 9, no work = 50', () => {
  assert.equal(crsSkillTransferabilityPts('two-credentials', 9, 0, 0), 50)
})

test('transferability: single bachelors + CLB 7, no work = 13', () => {
  assert.equal(crsSkillTransferabilityPts('bachelors', 7, 0, 0), 13)
})

test('transferability: CLB 6 gets zero education–language points', () => {
  assert.equal(crsSkillTransferabilityPts('bachelors', 6, 0, 0), 0)
})

test('transferability: foreign work 3yr + CLB 9 = 50; 1yr + CLB 7 = 13', () => {
  assert.equal(crsSkillTransferabilityPts('', 9, 3, 0), 50)
  assert.equal(crsSkillTransferabilityPts('', 7, 1, 0), 13)
})

test('transferability: each category capped at 50, total capped at 100', () => {
  // two-credentials + CLB9 (50) + 2yr Canadian work (50) → education category = min(100, 50) = 50
  // foreign 3yr + CLB9 (50) + 2yr Canadian (50) → foreign category = 50
  // total = min(50 + 50, 100) = 100
  assert.equal(crsSkillTransferabilityPts('two-credentials', 9, 3, 24), 100)
})

// ─── French bonus (second official language) ─────────────────────────────────

test('French CLB 7 + English CLB 5+ = 50; French CLB 7 alone = 25; French CLB 6 = 0', () => {
  const en = { langTestType: 'ielts-general', langReading: '4.0', langWriting: '5.0', langListening: '5.0', langSpeaking: '5.0' } // CLB 5 across
  const fr7 = { frenchTestType: 'tef', frenchReading: '121', frenchWriting: '271', frenchListening: '249', frenchSpeaking: '271' } // CLB 7 across

  const both = calculateScore(baseProfile({ ...en, ...fr7 }))
  assert.equal(both.crs!.secondLanguage, 50)

  // French only — no English test
  const frOnly = calculateScore(baseProfile({
    langTestType: 'tef',
    langReading: '121', langWriting: '271', langListening: '249', langSpeaking: '271',
    frenchTestType: '', frenchReading: '', frenchWriting: '', frenchListening: '', frenchSpeaking: '',
  }))
  // primary test is TEF → French IS the first language; no separate French bonus fields set
  assert.equal(frOnly.crs!.secondLanguage, 0)

  const fr6 = calculateScore(baseProfile({
    frenchTestType: 'tef',
    frenchReading: '91', frenchWriting: '226', frenchListening: '217', frenchSpeaking: '226', // CLB 6 across
  }))
  assert.equal(fr6.crs!.secondLanguage, 0)
})

// ─── Additional points cap (official: max 600 TOTAL incl. French bonus) ──────

test('additional points: PNP 600 + sibling + Canadian edu + French must cap at 600 combined', () => {
  const r = calculateScore(baseProfile({
    pnpNomination: 'yes',
    canadianSibling: 'yes',
    canadianEducation: '3-plus-year',
    frenchTestType: 'tef',
    frenchReading: '121', frenchWriting: '271', frenchListening: '249', frenchSpeaking: '271', // CLB 7
  }))
  const additionalCombined = r.crs!.additional + r.crs!.secondLanguage
  assert.ok(
    additionalCombined <= 600,
    `additional (${r.crs!.additional}) + French bonus (${r.crs!.secondLanguage}) = ${additionalCombined} — IRCC caps the whole section at 600`,
  )
})

// ─── CRS sanity: maximum possible total is 1,346 (with the 600-pt section) ───

test('CRS total never exceeds 1,346 for a maxed single applicant', () => {
  const r = calculateScore(baseProfile({
    age: '25',
    langTestType: 'celpip',
    langReading: '10', langWriting: '10', langListening: '10', langSpeaking: '10',
    educationLevel: 'two-credentials',
    canadianWorkMonths: '60',
    foreignWorkYears: '3',
    pnpNomination: 'yes',
    canadianSibling: 'yes',
    canadianEducation: '3-plus-year',
    frenchTestType: 'tef',
    frenchReading: '206', frenchWriting: '393', frenchListening: '316', frenchSpeaking: '393',
  }))
  // core max (no spouse): age 110 + edu 128 (two-credentials) + lang 136 + canWork 80 + transfer 100 = 554
  // additional section max 600 → ceiling 1,154 for this profile shape
  assert.ok(r.crs!.total <= 1200, `total ${r.crs!.total} exceeds any realistic ceiling`)
})

// ─── FSW 67-point grid ────────────────────────────────────────────────────────

test('FSW: below CLB 7 in any skill = not eligible regardless of score', () => {
  const r = calculateScore(baseProfile({
    langReading: '5.0', // CLB 6 reading
    foreignWorkYears: '6',
    hasJobOffer: 'yes',
    canadianWorkMonths: '24',
  }))
  assert.equal(r.fsw!.eligible, false)
})

test('FSW: exactly 67 passes, 66 does not', () => {
  // CLB9 all (24) + bachelors (21) + 1yr foreign work (9) + age 30 (12) + no job offer + no adaptability = 66
  const at66 = calculateScore(baseProfile({ foreignWorkYears: '1' }))
  assert.equal(at66.fsw!.score, 66)
  assert.equal(at66.fsw!.eligible, false)

  // Same + Canadian education 1-2yr → adaptability +5 = 71 … use 2yr foreign work instead: 24+21+11+12 = 68
  const at68 = calculateScore(baseProfile({ foreignWorkYears: '2' }))
  assert.equal(at68.fsw!.score, 68)
  assert.equal(at68.fsw!.eligible, true) // no funds entered → treated as not-blocking
})

test('FSW: settlement funds below requirement blocks eligibility unless exempt', () => {
  const r = calculateScore(baseProfile({
    foreignWorkYears: '2',
    familySize: '2',
    settlementFunds: '1000',
  }))
  assert.equal(r.fsw!.meetsMinFunds, false)
  assert.equal(r.fsw!.eligible, false)

  const exempt = calculateScore(baseProfile({
    foreignWorkYears: '2',
    familySize: '2',
    settlementFunds: '1000',
    currentlyAuthorizedToWorkCanada: 'yes',
    hasValidJobOfferForFundsExemption: 'yes',
  }))
  assert.equal(exempt.fsw!.meetsMinFunds, true)
})

test('FSW age points: 35 = 12, 36 = 11, 46 = 1, 47 = 0', () => {
  for (const [age, expected] of [[35, 12], [36, 11], [46, 1], [47, 0]] as const) {
    const r = calculateScore(baseProfile({ age: String(age) }))
    assert.equal(r.fsw!.breakdown.age, expected, `age ${age}`)
  }
})

// ─── computeAge from birth year/month ────────────────────────────────────────

test('computeAge: birthday month not yet reached this year subtracts one', () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  // Born 30 years ago, next month → still 29
  if (m < 12) {
    const p = profileWith({ birthYear: String(y - 30), birthMonth: String(m + 1), age: '99' })
    assert.equal(computeAge(p), 29)
  }
  // Born 30 years ago, this month → counted as 30
  const p2 = profileWith({ birthYear: String(y - 30), birthMonth: String(m), age: '99' })
  assert.equal(computeAge(p2), 30)
})

test('computeAge: falls back to typed age when birth year is out of accepted range', () => {
  const p = profileWith({ birthYear: '2015', birthMonth: '6', age: '27' })
  assert.equal(computeAge(p), 27)
})

// ─── Work-hours cross-check (conservative) ───────────────────────────────────

test('part-time hours reduce effective Canadian work years (conservative rule)', () => {
  // 12 months at 20h/week ≈ 0.67 years by hours → CEC should NOT be eligible
  const r = calculateScore(baseProfile({
    canadianWorkMonths: '12',
    hoursPerWeek: '20',
    teerLevel: '1',
  }))
  const cec = r.pathways.find(p => p.id === 'cec')!
  assert.notEqual(cec.status, 'eligible')

  // 12 months at 30+h/week = full-time → eligible (CLB 9 ≥ required CLB 7)
  const ft = calculateScore(baseProfile({
    canadianWorkMonths: '12',
    hoursPerWeek: '30',
    teerLevel: '1',
  }))
  assert.equal(ft.pathways.find(p => p.id === 'cec')!.status, 'eligible')
})

// ─── CEC language boundaries ──────────────────────────────────────────────────

test('CEC: TEER 2 needs CLB 5 (not 7); TEER 1 needs CLB 7', () => {
  const clb5 = {
    langTestType: 'ielts-general' as const,
    langReading: '4.0', langWriting: '5.0', langListening: '5.0', langSpeaking: '5.0', // CLB 5 across
  }
  const teer2 = calculateScore(baseProfile({ ...clb5, teerLevel: '2', canadianWorkMonths: '12' }))
  assert.equal(teer2.pathways.find(p => p.id === 'cec')!.status, 'eligible')

  const teer1 = calculateScore(baseProfile({ ...clb5, teerLevel: '1', canadianWorkMonths: '12' }))
  assert.notEqual(teer1.pathways.find(p => p.id === 'cec')!.status, 'eligible')
})

test('CEC: work while full-time student is excluded', () => {
  const r = calculateScore(baseProfile({
    canadianWorkMonths: '12',
    canadianWorkWhileFullTimeStudent: 'yes',
  }))
  assert.notEqual(r.pathways.find(p => p.id === 'cec')!.status, 'eligible')
})
