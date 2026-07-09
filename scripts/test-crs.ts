/**
 * CRS regression tests — run with: npx tsx scripts/test-crs.ts
 *
 * Verifies:
 *  1. crs-tables.ts returns known IRCC published values
 *  2. roughCRS() returns the right range for 4 representative profiles
 *
 * These are the canonical source of truth — if any of these fail after an
 * edit to crs-tables.ts or rough-crs.ts, something broke.
 */

import {
  crsAgePts,
  crsEducationPts,
  crsFirstLangSkillPts,
  crsCanadianWorkPts,
  crsSkillTransferabilityPts,
} from '../lib/crs-tables'
import { roughCRS } from '../lib/rough-crs'
import type { IntakeData } from '../lib/profile'

// ─── Tiny test harness ────────────────────────────────────────────────────────

let passed = 0, failed = 0

function eq(label: string, actual: number, expected: number) {
  if (actual === expected) {
    console.log(`  ✓ ${label}: ${actual}`)
    passed++
  } else {
    console.error(`  ✗ ${label}: got ${actual}, expected ${expected}`)
    failed++
  }
}

function inRange(label: string, value: number, low: number, high: number) {
  if (value >= low && value <= high) {
    console.log(`  ✓ ${label}: ${value} in [${low}, ${high}]`)
    passed++
  } else {
    console.error(`  ✗ ${label}: ${value} NOT in [${low}, ${high}]`)
    failed++
  }
}

function section(title: string) {
  console.log(`\n${title}`)
}

// ─── 1. Age points ────────────────────────────────────────────────────────────

section('Age points — no spouse (IRCC table A)')
eq('age 18',  crsAgePts(18, false), 99)
eq('age 19',  crsAgePts(19, false), 105)
eq('age 25',  crsAgePts(25, false), 110)
eq('age 30',  crsAgePts(30, false), 105)
eq('age 35',  crsAgePts(35, false), 77)
eq('age 40',  crsAgePts(40, false), 50)
eq('age 44',  crsAgePts(44, false), 6)
eq('age 45',  crsAgePts(45, false), 0)

section('Age points — with spouse (IRCC table A)')
eq('age 25',  crsAgePts(25, true), 100)
eq('age 35',  crsAgePts(35, true), 70)
eq('age 44',  crsAgePts(44, true), 5)
eq('age 45',  crsAgePts(45, true), 0)

// ─── 2. Education points ──────────────────────────────────────────────────────

section('Education points — no spouse (IRCC table B)')
eq('less-than-secondary', crsEducationPts('less-than-secondary', false), 0)
eq('secondary',           crsEducationPts('secondary',           false), 30)
eq('1-year',              crsEducationPts('1-year',              false), 90)
eq('2-year',              crsEducationPts('2-year',              false), 98)
eq('bachelors',           crsEducationPts('bachelors',           false), 120)
eq('two-credentials',     crsEducationPts('two-credentials',     false), 128)
eq('masters',             crsEducationPts('masters',             false), 135)
eq('professional',        crsEducationPts('professional',        false), 135)
eq('doctoral',            crsEducationPts('doctoral',            false), 150)

section('Education points — with spouse (IRCC table B)')
eq('bachelors', crsEducationPts('bachelors', true), 112)
eq('masters',   crsEducationPts('masters',   true), 126)
eq('doctoral',  crsEducationPts('doctoral',  true), 140)

// ─── 3. First language per-skill points ───────────────────────────────────────

section('First language per-skill — no spouse (IRCC table C, ×4 for total)')
eq('CLB 4–5', crsFirstLangSkillPts(4,  false), 6)
eq('CLB 6',   crsFirstLangSkillPts(6,  false), 9)
eq('CLB 7',   crsFirstLangSkillPts(7,  false), 17)
eq('CLB 8',   crsFirstLangSkillPts(8,  false), 23)
eq('CLB 9',   crsFirstLangSkillPts(9,  false), 31)
eq('CLB 10',  crsFirstLangSkillPts(10, false), 34)
eq('CLB 11',  crsFirstLangSkillPts(11, false), 34)  // capped at 10+
eq('CLB 3',   crsFirstLangSkillPts(3,  false), 0)

section('First language per-skill — with spouse')
eq('CLB 7',   crsFirstLangSkillPts(7,  true), 16)
eq('CLB 9',   crsFirstLangSkillPts(9,  true), 29)
eq('CLB 10',  crsFirstLangSkillPts(10, true), 32)

// ─── 4. Canadian work experience points ───────────────────────────────────────

section('Canadian work — no spouse (IRCC table D)')
eq('0 months',  crsCanadianWorkPts(0,  false), 0)
eq('11 months', crsCanadianWorkPts(11, false), 0)   // <1yr → 0
eq('12 months', crsCanadianWorkPts(12, false), 40)  // 1yr
eq('23 months', crsCanadianWorkPts(23, false), 40)  // still 1yr
eq('24 months', crsCanadianWorkPts(24, false), 53)  // 2yr
eq('36 months', crsCanadianWorkPts(36, false), 64)  // 3yr
eq('48 months', crsCanadianWorkPts(48, false), 72)  // 4yr
eq('60 months', crsCanadianWorkPts(60, false), 80)  // 5yr
eq('72 months', crsCanadianWorkPts(72, false), 80)  // capped at 5yr

section('Canadian work — with spouse')
eq('12 months', crsCanadianWorkPts(12, true), 35)
eq('60 months', crsCanadianWorkPts(60, true), 70)

// ─── 5. Skill transferability ─────────────────────────────────────────────────

section('Skill transferability — IRCC formula (max 100)')

// Advanced edu (masters) + CLB 9, no work → el=50, rest=0 → 50
eq('advEdu+CLB9, no work',         crsSkillTransferabilityPts('masters',   9, 0, 0),   50)
// Advanced edu + CLB 7, no work → el=25 → 25
eq('advEdu+CLB7, no work',         crsSkillTransferabilityPts('masters',   7, 0, 0),   25)
// Advanced edu + CLB 9 + 2yr Canadian → el=50, ec=50 → min(100,50)=50; fl=0, fc=0 → 50
eq('advEdu+CLB9+2yrCAN, no fgn',   crsSkillTransferabilityPts('masters',   9, 0, 24),  50)
// Advanced edu + CLB 9 + 3yr foreign + 2yr Canadian → el+ec=100, fl+fc=100 → 100
eq('advEdu+CLB9, 3yr+24moCAN',     crsSkillTransferabilityPts('masters',   9, 3, 24), 100)
// 1yr post (1-year) + CLB 9, no work → el=25, others 0 → 25
eq('anyPost+CLB9, no work',        crsSkillTransferabilityPts('1-year',    9, 0, 0),   25)
// 1yr post + CLB 7, no work → el=13 → 13
eq('anyPost+CLB7, no work',        crsSkillTransferabilityPts('1-year',    7, 0, 0),   13)
// No post-secondary + 1yr foreign + CLB 9 → fl=25 → 25
eq('noPost+CLB9, 1yr fgn',         crsSkillTransferabilityPts('secondary', 9, 1, 0),   25)
// No post-secondary + 3yr foreign + CLB 7 → fl=25 → 25
eq('noPost+CLB7, 3yr fgn',         crsSkillTransferabilityPts('secondary', 7, 3, 0),   25)
// No post-secondary, no work, no lang bonus → 0
eq('noPost+CLB6, no work',         crsSkillTransferabilityPts('secondary', 6, 0, 0),   0)
// 1yr post + 3yr foreign + CLB 9 + 24mo Canadian → el=25,ec=25; fl=25,fc=25 → min(50)+min(50)=100
eq('anyPost+CLB9, 3yr+24moCAN',    crsSkillTransferabilityPts('2-year',    9, 3, 24), 100)

// ─── 6. roughCRS() — 4 representative profiles ───────────────────────────────
//
// For each profile, manually compute the expected base CRS and confirm that
// roughCRS() returns a range that includes it. These also serve as smoke tests
// that the function wires the table calls correctly.

section('roughCRS() — range checks (base must be inside [low, high])')

function makeProfile(overrides: Partial<IntakeData>): IntakeData {
  return {
    fullName: '', email: '', phone: '', primaryUse: '',
    locationStatus: 'outside', status: 'outside-canada',
    plannedEntry: '', currentCountry: '', citizenship: '', province: '',
    intendedProvince: '', spouseComing: '', age: '28', dob: '',
    maritalStatus: 'single',
    langTestType: '', langReading: '', langWriting: '', langListening: '', langSpeaking: '',
    langTestDate: '', frenchTestType: '', frenchReading: '', frenchWriting: '',
    frenchListening: '', frenchSpeaking: '', selfReportedCLB: '9',
    educationLevel: 'masters', canadianEducation: '', ecaCompleted: '', ecaDate: '',
    canadianWorkMonths: '0', foreignWorkYears: '0', noc: '', teer: '', jobOffer: '',
    arrivalDate: '', permitExpiry: '', visaExpiryDate: '', visitorRecordExpiry: '',
    prDate: '', prCardExpiry: '', goal: '', hasRefusal: '', lostStatus: '',
    hasCriminality: '', hasRemovalOrder: '', hasMedical: '', quebecIntent: '',
    siblingInCanada: '', canadianSibling: '', fundsCad: '', familySize: '',
    _updatedAt: '',
    ...overrides,
  } as IntakeData
}

// Profile A: single, age 28, masters, CLB 9, no work
// Expected base: age=110 + edu=135 + lang=31×4=124 + canWork=0 + skill=50 = 419
{
  const p = makeProfile({ age: '28', educationLevel: 'masters', selfReportedCLB: '9', maritalStatus: 'single', foreignWorkYears: '0', canadianWorkMonths: '0' })
  const est = roughCRS(p)!
  const expectedBase = 110 + 135 + 124 + 0 + 50  // 419
  inRange('Profile A (single, 28, masters, CLB9, no work) base=419', expectedBase, est.low, est.high)
}

// Profile B: married, age 35, bachelors, CLB 7, 2yr foreign, no Canadian work
// Expected base: age=70 + edu=112 + lang=16×4=64 + canWork=0 + skill=25+13=38 = 284
// skill: advEdu+CLB7=25 (el), 2yr+CLB7=13 (fl), others 0 → min(25,50)+min(13,50)=38
{
  const p = makeProfile({ age: '35', educationLevel: 'bachelors', selfReportedCLB: '7', maritalStatus: 'married', foreignWorkYears: '2', canadianWorkMonths: '0' })
  const est = roughCRS(p)!
  const expectedBase = 70 + 112 + 64 + 0 + 38  // 284
  inRange('Profile B (married, 35, bachelors, CLB7, 2yr fgn) base=284', expectedBase, est.low, est.high)
}

// Profile C: single, age 32, doctoral, CLB 10, 5yr foreign, 24mo Canadian
// Expected base: age=94 + edu=150 + lang=34×4=136 + canWork=53 + skill=100 = 533
{
  const p = makeProfile({ age: '32', educationLevel: 'doctoral', selfReportedCLB: '10', maritalStatus: 'single', foreignWorkYears: '5', canadianWorkMonths: '24' })
  const est = roughCRS(p)!
  const expectedBase = 94 + 150 + 136 + 53 + 100  // 533
  inRange('Profile C (single, 32, doctoral, CLB10, 5yr fgn+2yr CAN) base=533', expectedBase, est.low, est.high)
}

// Profile D: single, age 40, 1-year diploma, CLB 6, no work
// Expected base: age=50 + edu=90 + lang=9×4=36 + canWork=0 + skill=0 = 176
// skill: anyPost but CLB6 < 7 → 0
{
  const p = makeProfile({ age: '40', educationLevel: '1-year', selfReportedCLB: '6', maritalStatus: 'single', foreignWorkYears: '0', canadianWorkMonths: '0' })
  const est = roughCRS(p)!
  const expectedBase = 50 + 90 + 36 + 0 + 0  // 176
  inRange('Profile D (single, 40, 1yr diploma, CLB6, no work) base=176', expectedBase, est.low, est.high)
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`)
console.log(`${passed} passed  ${failed > 0 ? `${failed} FAILED` : '0 failed'}`)
if (failed > 0) process.exit(1)
