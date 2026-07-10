/**
 * Regression guard for the CRS/CLB scoring engine.
 *
 * Each test profile has manually pre-calculated expected values derived directly
 * from the IRCC CRS criteria page. If the engine output differs, the data migration
 * introduced a bug and the build must not proceed.
 *
 * Run:  npx tsx scripts/verify-scoring.ts
 * Exit: 0 = all pass, 1 = any mismatch
 *
 * HOW TO ADD A TEST
 * -----------------
 * 1. Pick a profile with scores you can calculate by hand from the IRCC tables.
 * 2. Work out the expected CRS total on paper (or a spreadsheet).
 * 3. Add the case to CASES below.
 * 4. Run this script to confirm the engine matches.
 */

import { calculateScore, convertToCLB } from '../lib/scoring'
import type { IntakeData } from '../lib/profile'
import { EMPTY_PROFILE } from '../lib/profile'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profile(overrides: Partial<IntakeData>): IntakeData {
  return { ...EMPTY_PROFILE, ...overrides }
}

let passed = 0
let failed = 0

function assert(label: string, actual: number | string | boolean, expected: number | string | boolean) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`)
    passed++
  } else {
    console.error(`  FAIL  ${label}`)
    console.error(`        expected: ${expected}`)
    console.error(`        actual:   ${actual}`)
    failed++
  }
}

// ─── CLB Conversion Tests ─────────────────────────────────────────────────────
// Values hand-checked against the IRCC language testing equivalency page.

console.log('\nCLB conversion')

;(() => {
  // IELTS General: r=8.0 → CLB 10 (first bracket), w=7.5 → CLB 10, l=8.5 → CLB 10, s=7.0 → CLB 9
  const clb = convertToCLB('ielts-general', { r: 8.0, w: 7.5, l: 8.5, s: 7.0 })
  assert('IELTS r=8.0 → CLB 10', clb!.r, 10)
  assert('IELTS w=7.5 → CLB 10', clb!.w, 10)
  assert('IELTS l=8.5 → CLB 10', clb!.l, 10)
  assert('IELTS s=7.0 → CLB 9',  clb!.s, 9)
})()

;(() => {
  // IELTS General: r=6.0 → CLB 7, l=5.5 → CLB 6, s=4.0 → CLB 4
  const clb = convertToCLB('ielts-general', { r: 6.0, w: 6.0, l: 5.5, s: 4.0 })
  assert('IELTS r=6.0 → CLB 7', clb!.r, 7)
  assert('IELTS l=5.5 → CLB 6', clb!.l, 6)
  assert('IELTS s=4.0 → CLB 4', clb!.s, 4)
})()

;(() => {
  // CELPIP: direct 1:1 mapping, clamped 3–10
  const clb = convertToCLB('celpip', { r: 9, w: 8, l: 10, s: 7 })
  assert('CELPIP r=9 → CLB 9',  clb!.r, 9)
  assert('CELPIP w=8 → CLB 8',  clb!.w, 8)
  assert('CELPIP l=10 → CLB 10', clb!.l, 10)
  assert('CELPIP s=7 → CLB 7',  clb!.s, 7)
})()

;(() => {
  // PTE Core: r=69 → CLB 8, w=88 → CLB 9, l=60 → CLB 7, s=51 → CLB 5
  const clb = convertToCLB('pte', { r: 69, w: 88, l: 60, s: 51 })
  assert('PTE r=69 → CLB 8', clb!.r, 8)
  assert('PTE w=88 → CLB 9', clb!.w, 9)
  assert('PTE l=60 → CLB 7', clb!.l, 7)
  assert('PTE s=51 → CLB 5', clb!.s, 5)
})()

;(() => {
  // TEF: r=121 → CLB 7, w=271 → CLB 7, l=249 → CLB 7, s=271 → CLB 7
  const clb = convertToCLB('tef', { r: 121, w: 271, l: 249, s: 271 })
  assert('TEF r=121 → CLB 7', clb!.r, 7)
  assert('TEF w=271 → CLB 7', clb!.w, 7)
  assert('TEF l=249 → CLB 7', clb!.l, 7)
  assert('TEF s=271 → CLB 7', clb!.s, 7)
})()

;(() => {
  // TCF: r=499 → CLB 8, w=12 → CLB 8, l=458 → CLB 7, s=10 → CLB 7
  const clb = convertToCLB('tcf', { r: 499, w: 12, l: 458, s: 10 })
  assert('TCF r=499 → CLB 8', clb!.r, 8)
  assert('TCF w=12  → CLB 8', clb!.w, 8)
  assert('TCF l=458 → CLB 7', clb!.l, 7)
  assert('TCF s=10  → CLB 7', clb!.s, 7)
})()

// ─── CRS Total Tests ──────────────────────────────────────────────────────────
// Expected totals hand-calculated from the IRCC CRS criteria table.
// Workings are shown inline so any future mismatch is traceable.

console.log('\nCRS totals')

;(() => {
  // Profile 1: FSW applicant, age 30, IELTS all CLB 10, Bachelors, 3yr foreign, 0 Canadian work
  // age=105, edu=120, lang=34×4=136, canWork=0
  // skillTrans: el=50(advEdu+CLB9) ec=0(0 canYrs) fl=50(3yr+CLB9) fc=0 → min(50,50)+min(50,50)=100
  // additional=0 → Total: 105+120+136+0+0+0+100+0 = 461
  const s = calculateScore(profile({
    age: '30', birthYear: '', birthMonth: '',  // explicit age — year-stable
    maritalStatus: 'single', spouseComing: 'no',
    langTestType: 'ielts-general',
    langReading: '8.0', langWriting: '7.5', langListening: '8.5', langSpeaking: '7.5',
    educationLevel: 'bachelors',
    foreignWorkYears: '3', canadianWorkMonths: '0',
    teerLevel: '1',
    locationStatus: 'outside',
  }))
  assert('Profile 1: CRS total', s.crs!.total, 461)
  assert('Profile 1: age pts',   s.crs!.age,   105)
  assert('Profile 1: edu pts',   s.crs!.education, 120)
  assert('Profile 1: lang pts',  s.crs!.firstLanguage, 136)
  assert('Profile 1: skill transferability', s.crs!.skillTransferability, 100)
})()

;(() => {
  // Profile 2: CELPIP CLB 9, Bachelors, age 25, 12mo Canadian work, 0 foreign
  // age=110, edu=120, lang=31×4=124, canWork=40(1yr)
  // skillTrans: el=50(advEdu+CLB9) ec=25(advEdu+1yr) fl=0 fc=0 → min(75,50)+0=50
  // Total: 110+120+124+0+0+40+50+0 = 444
  const s = calculateScore(profile({
    age: '25', birthYear: '', birthMonth: '',
    maritalStatus: 'single', spouseComing: 'no',
    langTestType: 'celpip',
    langReading: '9', langWriting: '9', langListening: '9', langSpeaking: '9',
    educationLevel: 'bachelors',
    foreignWorkYears: '0', canadianWorkMonths: '12',
    teerLevel: '1',
    locationStatus: 'inside', status: 'work-permit',
  }))
  assert('Profile 2: CRS total', s.crs!.total, 444)
  assert('Profile 2: canWork pts', s.crs!.canadianExperience, 40)
  assert('Profile 2: skill transferability', s.crs!.skillTransferability, 50)
})()

;(() => {
  // Profile 3: TEF CLB 7 all skills, secondary education, age 35, no work
  // age=77, edu=30, lang=17×4=68, canWork=0
  // skillTrans=0 (secondary not in anyPostEducation list)
  // Total: 77+30+68+0+0+0+0+0 = 175
  const s = calculateScore(profile({
    age: '35', birthYear: '', birthMonth: '',
    maritalStatus: 'single', spouseComing: 'no',
    langTestType: 'tef',
    langReading: '121', langWriting: '271', langListening: '249', langSpeaking: '271',
    educationLevel: 'secondary',
    foreignWorkYears: '0', canadianWorkMonths: '0',
    teerLevel: '4',
    locationStatus: 'outside',
  }))
  assert('Profile 3: CRS total', s.crs!.total, 175)
  assert('Profile 3: lang pts', s.crs!.firstLanguage, 68)
  assert('Profile 3: skill transferability', s.crs!.skillTransferability, 0)
})()

;(() => {
  // Profile 4: PTE CLB 8, Masters, age 32, with spouse (CELPIP CLB 7, 1-year edu), 2yr Canadian, 2yr foreign
  // age=85(w/spouse), edu=126, lang=22×4=88, canWork=46(2yr w/spouse)
  // skillTrans: el=25(advEdu+CLB7) ec=50(advEdu+2yr) fl=13(1yr+CLB7) fc=25(1yr+2yr) → min(75,50)+min(38,50)=88
  // spouseFactors: spouseLang=3×4=12, spouseEdu=5(1-yr), spouseCanWork=0 → 17
  // Total: 85+126+88+0+17+46+88+0 = 450
  const s = calculateScore(profile({
    age: '32', birthYear: '', birthMonth: '',
    maritalStatus: 'married', spouseComing: 'yes',
    langTestType: 'pte',
    langReading: '69', langWriting: '79', langListening: '71', langSpeaking: '76',
    spouseLangTestType: 'celpip',
    spouseLangReading: '7', spouseLangWriting: '7', spouseLangListening: '7', spouseLangSpeaking: '7',
    spouseEducationLevel: '1-year',
    spouseCanadianWorkMonths: '0',
    educationLevel: 'masters',
    foreignWorkYears: '2', canadianWorkMonths: '24',
    teerLevel: '1',
    locationStatus: 'inside', status: 'work-permit',
  }))
  assert('Profile 4: CRS total', s.crs!.total, 450)
  assert('Profile 4: spouse factors', s.crs!.spouseFactors, 17)
  assert('Profile 4: skill transferability', s.crs!.skillTransferability, 88)
})()

;(() => {
  // Profile 5: PNP nomination — verifies additional points come from rule data, not a hardcoded literal
  // PTE CLB 8, Bachelors, age 38, 1yr Canadian work, PNP=yes
  // age=61, edu=120, lang=23×4=92, canWork=40(1yr)
  // skillTrans: el=25(advEdu+CLB7) ec=25(advEdu+1yr) fl=0 fc=0 → min(50,50)+0=50
  // additional=600(PNP) → Total: 61+120+92+0+0+40+50+600 = 963
  const s = calculateScore(profile({
    age: '38', birthYear: '', birthMonth: '',
    maritalStatus: 'single', spouseComing: 'no',
    langTestType: 'pte',
    langReading: '69', langWriting: '79', langListening: '71', langSpeaking: '76',
    educationLevel: 'bachelors',
    foreignWorkYears: '0', canadianWorkMonths: '12',
    teerLevel: '1',
    pnpNomination: 'yes',
    locationStatus: 'inside', status: 'work-permit',
  }))
  assert('Profile 5: CRS total', s.crs!.total, 963)
  assert('Profile 5: additional pts (PNP)', s.crs!.additional, 600)
})()

;(() => {
  // Profile 6: Canadian sibling + Canadian education — confirms rule-driven additional points
  // CELPIP CLB 9, Bachelors, age 28, Canadian 3+ year edu, Canadian sibling
  // additional: 30 (3+ yr Canadian edu) + 15 (sibling) = 45
  const s = calculateScore(profile({
    birthYear: '1996', birthMonth: '1',  // age 28
    maritalStatus: 'single', spouseComing: 'no',
    langTestType: 'celpip',
    langReading: '9', langWriting: '9', langListening: '9', langSpeaking: '9',
    educationLevel: 'bachelors',
    canadianEducation: '3-plus-year',
    canadianSibling: 'yes',
    foreignWorkYears: '0', canadianWorkMonths: '0',
    teerLevel: '1',
    locationStatus: 'outside',
  }))
  assert('Profile 6: additional pts (sibling + Canadian edu)', s.crs!.additional, 45)
})()

// ─── Version-selection boundary tests ────────────────────────────────────────
// The classic off-by-one: 2025-03-24 must use old rules (job offer = 200/50 pts),
// 2025-03-25 must use new rules (job offer = 0 pts).

console.log('\nVersion-selection boundary (job-offer rule change 2025-03-25)')

;(() => {
  const { getActiveRule } = require('../rules/loader')
  const { crsVersions } = require('../rules/crs')

  const before = getActiveRule(crsVersions, '2025-03-24')
  const after  = getActiveRule(crsVersions, '2025-03-25')

  assert('2025-03-24: arrangedEmployment teer01 = 200', before.data.additional.arrangedEmployment.teer01, 200)
  assert('2025-03-24: arrangedEmployment teer23 = 50',  before.data.additional.arrangedEmployment.teer23, 50)
  assert('2025-03-24: effectiveDate = 2024-01-01',      before.effectiveDate, '2024-01-01')

  assert('2025-03-25: arrangedEmployment teer01 = 0',   after.data.additional.arrangedEmployment.teer01, 0)
  assert('2025-03-25: arrangedEmployment teer23 = 0',   after.data.additional.arrangedEmployment.teer23, 0)
  assert('2025-03-25: effectiveDate = 2025-03-25',      after.effectiveDate, '2025-03-25')
})()

// ─── Result ───────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} assertions: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  console.error('Scoring engine output does not match expected values.')
  console.error('The data migration likely introduced a typo. Do not merge until all assertions pass.')
  process.exit(1)
}
