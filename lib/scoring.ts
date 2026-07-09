import type { IntakeData } from './profile'
import { getRequiredFunds } from './profile'
import { crsAgePts, crsEducationPts, crsFirstLangSkillPts, crsCanadianWorkPts, crsSkillTransferabilityPts } from './crs-tables'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CLBScores = { r: number; w: number; l: number; s: number }

export type CRSBreakdown = {
  age: number
  education: number
  firstLanguage: number
  secondLanguage: number
  spouseFactors: number
  canadianExperience: number
  skillTransferability: number
  additional: number
  total: number
}

export type FSWResult = {
  score: number
  eligible: boolean
  meetsWorkRequirement: boolean
  meetsMinFunds: boolean
  breakdown: {
    language: number
    education: number
    workExperience: number
    age: number
    jobOffer: number
    adaptability: number
  }
}

export type PathwayStatus = {
  id: string
  name: string
  status: 'eligible' | 'not-yet' | 'possible' | 'not-applicable' | 'high-risk'
  reason: string
}

export type Improvement = {
  label: string
  impact: string
  action: string
}

export type RiskFlag = {
  level: 'warning' | 'critical'
  message: string
}

export type ScoreResult = {
  clb: CLBScores | null
  crs: CRSBreakdown | null
  fsw: FSWResult | null
  pathways: PathwayStatus[]
  improvements: Improvement[]
  riskFlags: RiskFlag[]
  hasEnoughData: boolean
  missingFields: string[]
}

// ─── CLB Conversion — English tests ───────────────────────────────────────────

function ieltsToCLB(scores: CLBScores): CLBScores {
  const tables: Record<keyof CLBScores, [number, number][]> = {
    r: [[8.0,10],[7.0,9],[6.5,8],[6.0,7],[5.0,6],[4.0,5],[3.5,4]],
    w: [[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
    l: [[8.5,10],[8.0,9],[7.5,8],[6.0,7],[5.5,6],[5.0,5],[4.5,4]],
    s: [[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
  }
  function convert(score: number, skill: keyof CLBScores): number {
    for (const [min, clb] of tables[skill]) if (score >= min) return clb
    return 3
  }
  return { r: convert(scores.r,'r'), w: convert(scores.w,'w'), l: convert(scores.l,'l'), s: convert(scores.s,'s') }
}

function celpipToCLB(scores: CLBScores): CLBScores {
  const cap = (n: number) => Math.min(Math.max(Math.floor(n), 3), 10)
  return { r: cap(scores.r), w: cap(scores.w), l: cap(scores.l), s: cap(scores.s) }
}

// Corrected PTE Core CLB equivalency — IRCC official tables
function pteCoreToCLB(scores: CLBScores): CLBScores {
  function reading(s: number) {
    if (s >= 88) return 10; if (s >= 78) return 9; if (s >= 69) return 8
    if (s >= 60) return 7;  if (s >= 51) return 6; if (s >= 42) return 5
    if (s >= 33) return 4;  if (s >= 24) return 3; return 0
  }
  function writing(s: number) {
    if (s >= 90) return 10; if (s >= 88) return 9; if (s >= 79) return 8
    if (s >= 69) return 7;  if (s >= 60) return 6; if (s >= 51) return 5
    if (s >= 41) return 4;  if (s >= 32) return 3; return 0
  }
  function listening(s: number) {
    if (s >= 89) return 10; if (s >= 82) return 9; if (s >= 71) return 8
    if (s >= 60) return 7;  if (s >= 50) return 6; if (s >= 39) return 5
    if (s >= 28) return 4;  if (s >= 18) return 3; return 0
  }
  function speaking(s: number) {
    if (s >= 89) return 10; if (s >= 84) return 9; if (s >= 76) return 8
    if (s >= 68) return 7;  if (s >= 59) return 6; if (s >= 51) return 5
    if (s >= 42) return 4;  if (s >= 34) return 3; return 0
  }
  return { r: reading(scores.r), w: writing(scores.w), l: listening(scores.l), s: speaking(scores.s) }
}

// ─── CLB Conversion — French tests ────────────────────────────────────────────

function tefToCLB(scores: CLBScores): CLBScores {
  function listening(s: number) {
    if (s >= 316) return 10; if (s >= 298) return 9; if (s >= 280) return 8
    if (s >= 249) return 7;  if (s >= 217) return 6; if (s >= 181) return 5
    if (s >= 145) return 4;  return 3
  }
  function speaking(s: number) {
    if (s >= 393) return 10; if (s >= 349) return 9; if (s >= 310) return 8
    if (s >= 271) return 7;  if (s >= 226) return 6; if (s >= 181) return 5
    if (s >= 151) return 4;  return 3
  }
  function reading(s: number) {
    if (s >= 206) return 10; if (s >= 181) return 9; if (s >= 151) return 8
    if (s >= 121) return 7;  if (s >= 91)  return 6; if (s >= 71)  return 5
    if (s >= 60)  return 4;  return 3
  }
  function writing(s: number) {
    if (s >= 393) return 10; if (s >= 349) return 9; if (s >= 310) return 8
    if (s >= 271) return 7;  if (s >= 226) return 6; if (s >= 181) return 5
    if (s >= 151) return 4;  return 3
  }
  return { r: reading(scores.r), w: writing(scores.w), l: listening(scores.l), s: speaking(scores.s) }
}

function tcfToCLB(scores: CLBScores): CLBScores {
  function listening(s: number) {
    if (s >= 549) return 10; if (s >= 523) return 9; if (s >= 503) return 8
    if (s >= 458) return 7;  if (s >= 398) return 6; if (s >= 369) return 5
    if (s >= 331) return 4;  return 3
  }
  function speaking(s: number) {
    if (s >= 16) return 10; if (s >= 14) return 9; if (s >= 12) return 8
    if (s >= 10) return 7;  if (s >= 7)  return 6; if (s >= 6)  return 5
    if (s >= 4)  return 4;  return 3
  }
  function reading(s: number) {
    if (s >= 549) return 10; if (s >= 524) return 9; if (s >= 499) return 8
    if (s >= 453) return 7;  if (s >= 406) return 6; if (s >= 375) return 5
    if (s >= 342) return 4;  return 3
  }
  function writing(s: number) {
    if (s >= 16) return 10; if (s >= 14) return 9; if (s >= 12) return 8
    if (s >= 10) return 7;  if (s >= 7)  return 6; if (s >= 6)  return 5
    if (s >= 4)  return 4;  return 3
  }
  return { r: reading(scores.r), w: writing(scores.w), l: listening(scores.l), s: speaking(scores.s) }
}

export function convertToCLB(testType: string, scores: CLBScores): CLBScores | null {
  if (!testType || testType === 'none') return null
  const { r, w, l, s } = scores
  if (isNaN(r) || isNaN(w) || isNaN(l) || isNaN(s)) return null
  if (testType === 'ielts-general') return ieltsToCLB(scores)
  if (testType === 'celpip') return celpipToCLB(scores)
  if (testType === 'pte') return pteCoreToCLB(scores)
  if (testType === 'tef') return tefToCLB(scores)
  if (testType === 'tcf') return tcfToCLB(scores)
  return null
}

// ─── CRS — Core point tables (imported from shared module) ────────────────────

function firstLangPts(clb: number, spouseComing: boolean): number {
  return crsFirstLangSkillPts(clb, spouseComing)
}

function agePts(age: number, spouseComing: boolean): number {
  return crsAgePts(age, spouseComing)
}

function educationPts(level: string, spouseComing: boolean): number {
  return crsEducationPts(level, spouseComing)
}

function canadianWorkPts(months: number, spouseComing: boolean): number {
  return crsCanadianWorkPts(months, spouseComing)
}

// ─── CRS — Spouse Factors ─────────────────────────────────────────────────────

function spouseLangPts(clb: number): number {
  if (clb >= 9) return 5; if (clb === 8) return 4; if (clb === 7) return 3
  if (clb === 6) return 2; if (clb >= 4) return 1; return 0
}

function spouseEducationPts(level: string): number {
  const map: Record<string, number> = {
    'less-than-secondary': 0, secondary: 2,
    '1-year': 5, '2-year': 6, bachelors: 7,
    'two-credentials': 7, masters: 8, doctoral: 10,
  }
  return map[level] ?? 0
}

function spouseCanadianWorkPts(months: number): number {
  const years = Math.floor(months / 12)
  if (years >= 5) return 10; if (years >= 3) return 9
  if (years >= 2) return 7;  if (years >= 1) return 5
  return 0
}

function calculateSpouseFactors(profile: IntakeData): number {
  if (profile.spouseComing !== 'yes') return 0
  let pts = 0
  const rawSpouseLang: CLBScores = {
    r: parseFloat(profile.spouseLangReading),
    w: parseFloat(profile.spouseLangWriting),
    l: parseFloat(profile.spouseLangListening),
    s: parseFloat(profile.spouseLangSpeaking),
  }
  const spouseClb = convertToCLB(profile.spouseLangTestType, rawSpouseLang)
  if (spouseClb) {
    const langPts = spouseLangPts(spouseClb.r) + spouseLangPts(spouseClb.w) +
                    spouseLangPts(spouseClb.l) + spouseLangPts(spouseClb.s)
    pts += Math.min(langPts, 20)
  }
  if (profile.spouseEducationLevel) pts += Math.min(spouseEducationPts(profile.spouseEducationLevel), 10)
  const spouseCanMonths = parseFloat(profile.spouseCanadianWorkMonths) || 0
  pts += Math.min(spouseCanadianWorkPts(spouseCanMonths), 10)
  return Math.min(pts, 40)
}

// ─── CRS — Skill Transferability ─────────────────────────────────────────────

function skillTransferabilityPts(
  educationLevel: string,
  clb: CLBScores | null,
  foreignWorkYears: number,
  canadianWorkMonths: number,
): number {
  const minLang = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0
  return crsSkillTransferabilityPts(educationLevel, minLang, foreignWorkYears, canadianWorkMonths)
}

// ─── CRS — Second Official Language (French) ─────────────────────────────────

function secondLangPts(frenchClb: CLBScores | null, englishClb: CLBScores | null): number {
  if (!frenchClb) return 0
  const frenchMin = Math.min(frenchClb.r, frenchClb.w, frenchClb.l, frenchClb.s)
  if (frenchMin < 7) return 0
  if (englishClb) {
    const englishMin = Math.min(englishClb.r, englishClb.w, englishClb.l, englishClb.s)
    if (englishMin >= 5) return 50
  }
  return 25
}

// ─── CRS — Additional Points ──────────────────────────────────────────────────
// NOTE: Job-offer CRS points removed March 25, 2025. Do NOT add them back.

function additionalPts(
  canadianEducation: string,
  canadianSibling: string,
  pnpNomination: boolean,
): number {
  let pts = 0
  if (pnpNomination) pts += 600
  // Job offer CRS points removed March 25, 2025 — 0 points
  if (canadianEducation === '3-plus-year') pts += 30
  else if (canadianEducation === '1-2-year') pts += 15
  if (canadianSibling === 'yes') pts += 15
  return pts
}

// ─── FSW 67/100 ───────────────────────────────────────────────────────────────

function fswLangPts(clb: CLBScores | null): number {
  if (!clb) return 0
  const minCLB = Math.min(clb.r, clb.w, clb.l, clb.s)
  if (minCLB < 7) return 0
  const per = (c: number) => c >= 9 ? 6 : c === 8 ? 5 : 4
  return per(clb.r) + per(clb.w) + per(clb.l) + per(clb.s)
}

function fswEduPts(level: string): number {
  const map: Record<string, number> = {
    'less-than-secondary': 0, secondary: 5, '1-year': 15, '2-year': 19,
    bachelors: 21, 'two-credentials': 22, masters: 23, professional: 23, doctoral: 25,
  }
  return map[level] ?? 0
}

function fswWorkPts(years: number): number {
  if (years >= 6) return 15; if (years >= 4) return 13
  if (years >= 2) return 11; if (years >= 1) return 9
  return 0
}

function fswAgePts(age: number): number {
  if (age < 18) return 0
  if (age <= 35) return 12; if (age === 36) return 11; if (age === 37) return 10
  if (age === 38) return 9;  if (age === 39) return 8;  if (age === 40) return 7
  if (age === 41) return 6;  if (age === 42) return 5;  if (age === 43) return 4
  if (age === 44) return 3;  if (age === 45) return 2;  if (age === 46) return 1
  return 0
}

// ─── Canadian Work Year Calculation ──────────────────────────────────────────

function calculateCanadianWorkYears(profile: IntakeData): number {
  const months = parseFloat(profile.canadianWorkMonths || '0')
  const yearsByMonths = months / 12
  // Cross-check via hours/week if available (IRCC uses ~1,560 hrs/yr for FTE)
  const hoursPerWeek = parseFloat(profile.hoursPerWeek || '0')
  if (hoursPerWeek > 0 && months > 0) {
    const totalHours = hoursPerWeek * (months * 4.33)
    const yearsByHours = totalHours / 1560
    // Use the more conservative of the two
    return Math.min(yearsByMonths, yearsByHours)
  }
  return yearsByMonths
}

// ─── CEC Assessment ───────────────────────────────────────────────────────────

function assessCEC(profile: IntakeData, clb: CLBScores | null, canMonths: number): PathwayStatus {
  const teer = profile.teerLevel
  const minCLB = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0
  const canadianYears = calculateCanadianWorkYears(profile)
  const skilledTeer = ['0', '1', '2', '3'].includes(teer)
  const requiredCLB = (teer === '0' || teer === '1') ? 7 : 5
  const authorized = profile.canadianWorkAuthorized !== 'no'
  const whileStudent = profile.canadianWorkWhileFullTimeStudent === 'yes'

  if (!skilledTeer) {
    return {
      id: 'cec', name: 'Canadian Experience Class',
      status: 'not-applicable',
      reason: 'CEC requires skilled Canadian work in TEER 0, 1, 2, or 3.',
    }
  }

  if (!authorized) {
    return {
      id: 'cec', name: 'Canadian Experience Class',
      status: 'not-yet',
      reason: 'CEC work experience must be authorized Canadian work.',
    }
  }

  if (whileStudent) {
    return {
      id: 'cec', name: 'Canadian Experience Class',
      status: 'not-yet',
      reason: 'Work while studying full-time generally should not be counted toward the CEC 1-year requirement.',
    }
  }

  if (canadianYears >= 1 && minCLB >= requiredCLB) {
    return {
      id: 'cec', name: 'Canadian Experience Class',
      status: 'eligible',
      reason: 'You may meet the basic CEC screening criteria: 1 year of authorized skilled Canadian work and required language level.',
    }
  }

  if (canadianYears < 1) {
    const monthsLeft = Math.ceil((1 - canadianYears) * 12)
    return {
      id: 'cec', name: 'Canadian Experience Class',
      status: canMonths > 0 ? 'not-yet' : 'not-applicable',
      reason: `${monthsLeft} more month${monthsLeft !== 1 ? 's' : ''} of TEER ${teer} skilled Canadian work needed.`,
    }
  }

  return {
    id: 'cec', name: 'Canadian Experience Class',
    status: 'not-yet',
    reason: `Language is below the CEC minimum for TEER ${teer}. Required: CLB ${requiredCLB} in all 4 skills.`,
  }
}

// ─── FSW Assessment ───────────────────────────────────────────────────────────

function isExemptFromFSWFunds(profile: IntakeData): boolean {
  return (
    profile.currentlyAuthorizedToWorkCanada === 'yes' &&
    profile.hasValidJobOfferForFundsExemption === 'yes'
  )
}

function assessFSW(
  profile: IntakeData,
  clb: CLBScores | null,
  age: number,
): FSWResult {
  const minCLB = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0
  const foreignYears = parseFloat(profile.foreignWorkYears || '0')
  const teer = profile.teerLevel
  const skilledTeer = ['0', '1', '2', '3'].includes(teer)
  // Use continuousSkilledWork1yr if provided, otherwise fall back to year count
  const continuousOneYear = profile.continuousSkilledWork1yr === 'yes' || foreignYears >= 1
  const meetsWorkRequirement = skilledTeer && continuousOneYear

  const familySize = parseInt(profile.familySize || '1')
  const funds = parseFloat(profile.settlementFunds || '0')
  const requiredFunds = getRequiredFunds(familySize)
  const fundsExempt = isExemptFromFSWFunds(profile)
  const meetsMinFunds = fundsExempt || !profile.settlementFunds || funds >= requiredFunds

  const langPts = fswLangPts(clb)
  const eduPts = fswEduPts(profile.educationLevel)
  const workPts = fswWorkPts(foreignYears)
  const agePts2 = fswAgePts(age)
  // Job offer still gives FSW selection-factor points (10 pts) but NOT CRS points
  const jobOfferPts = profile.hasJobOffer === 'yes' ? 10 : 0
  const canMonths = parseFloat(profile.canadianWorkMonths || '0')
  const adaptPts = canMonths >= 12 ? 10 :
    (profile.canadianEducation && profile.canadianEducation !== 'none' ? 5 : 0)
  const fswTotal = langPts + eduPts + workPts + agePts2 + jobOfferPts + adaptPts

  return {
    score: fswTotal,
    eligible: meetsWorkRequirement && minCLB >= 7 && fswTotal >= 67 && meetsMinFunds,
    meetsWorkRequirement,
    meetsMinFunds,
    breakdown: {
      language: langPts,
      education: eduPts,
      workExperience: workPts,
      age: agePts2,
      jobOffer: jobOfferPts,
      adaptability: adaptPts,
    },
  }
}

// ─── FST Assessment ───────────────────────────────────────────────────────────

function assessFST(profile: IntakeData, clb: CLBScores | null, foreignYears: number): PathwayStatus {
  const teer = profile.teerLevel
  // FST covers TEER 2 and 3 trade occupations — we use TEER as a proxy since we don't parse NOC groups
  const tradesTeer = teer === '2' || teer === '3'

  // Language: CLB 5 speaking + listening, CLB 4 reading + writing
  const langOk = clb
    ? clb.s >= 5 && clb.l >= 5 && clb.r >= 4 && clb.w >= 4
    : false

  // Work experience: 2+ years full-time skilled trade work in last 5 years
  // We use foreignWorkYears as the signal (Canadian work also counts but treated separately)
  const canYears = parseFloat(profile.canadianWorkMonths || '0') / 12
  const totalSkillYears = foreignYears + canYears
  const hasWorkExp = totalSkillYears >= 2

  // Requirement: valid job offer (1+ year) OR certificate of qualification from a province/territory
  // We track job offer; certificate of qualification field not yet in profile
  const hasJobOffer = profile.hasJobOffer === 'yes'

  if (!tradesTeer) {
    return {
      id: 'fst', name: 'Federal Skilled Trades',
      status: 'not-applicable',
      reason: 'FST requires a TEER 2 or 3 skilled trades occupation.',
    }
  }

  if (!langOk && !clb) {
    return {
      id: 'fst', name: 'Federal Skilled Trades',
      status: 'not-yet',
      reason: 'FST requires CLB 5 in speaking and listening, and CLB 4 in reading and writing.',
    }
  }

  if (!langOk) {
    return {
      id: 'fst', name: 'Federal Skilled Trades',
      status: 'not-yet',
      reason: `FST language minimum: CLB 5 speaking/listening, CLB 4 reading/writing. Your scores are below this threshold.`,
    }
  }

  if (!hasWorkExp) {
    const yearsLeft = Math.ceil((2 - totalSkillYears) * 10) / 10
    return {
      id: 'fst', name: 'Federal Skilled Trades',
      status: 'not-yet',
      reason: `FST requires 2 years of full-time skilled trade work in the last 5 years. You need approximately ${yearsLeft} more year${yearsLeft !== 1 ? 's' : ''}.`,
    }
  }

  if (!hasJobOffer) {
    return {
      id: 'fst', name: 'Federal Skilled Trades',
      status: 'possible',
      reason: 'You may meet the FST work and language requirements. FST also needs either a valid full-time job offer of at least 1 year, or a certificate of qualification in your trade from a Canadian province/territory.',
    }
  }

  return {
    id: 'fst', name: 'Federal Skilled Trades',
    status: 'eligible',
    reason: 'You may meet the basic FST screening criteria: TEER 2/3 trades occupation, 2+ years experience, language minimum, and a job offer.',
  }
}

// ─── PGWP Assessment — 2026 ───────────────────────────────────────────────────
// IRCC PGWP rules change without notice. Update this date whenever you verify the rules.
const PGWP_DATA_VERIFIED = 'June 2026'

function assessPGWP(profile: IntakeData): PathwayStatus | null {
  if (profile.status !== 'student') return null

  const programMonths = parseFloat(profile.programLengthMonths || '0')
  const hasDLI = profile.dliNumber !== '' || profile.schoolIsDLI === 'yes'
  const programEligible = profile.programPgwpEligible === 'yes'
  const basicProgramOk = hasDLI && programEligible && programMonths >= 8
  // Flight school graduates are exempt from language requirement
  const languageOk = profile.graduatedFromFlightSchool === 'yes' || profile.pgwpLanguageMet === 'yes'
  // Field-of-study check only required for some programs (2026 frozen list)
  const fieldOk = profile.fieldOfStudyRequired !== 'yes' || profile.cipCodeEligible === 'yes'

  const verifiedNote = `PGWP rules last verified: ${PGWP_DATA_VERIFIED}. Always confirm current requirements at canada.ca before applying.`

  if (basicProgramOk && languageOk && fieldOk) {
    return {
      id: 'pgwp', name: 'PGWP → CEC pathway',
      status: 'possible',
      reason: `You may meet the basic PGWP screening factors. After graduating and getting a PGWP, complete 1 year of authorized skilled Canadian work to screen for CEC. ${verifiedNote}`,
    }
  }

  if (programMonths < 8) {
    return {
      id: 'pgwp', name: 'Post-Graduation Work Permit',
      status: 'not-yet',
      reason: `Programs under 8 months generally do not qualify for a PGWP. ${verifiedNote}`,
    }
  }

  if (!hasDLI || !programEligible) {
    return {
      id: 'pgwp', name: 'Post-Graduation Work Permit',
      status: 'not-yet',
      reason: `PGWP requires graduation from a designated learning institution (DLI) in an eligible program. Not every DLI program qualifies. ${verifiedNote}`,
    }
  }

  if (!languageOk) {
    return {
      id: 'pgwp', name: 'Post-Graduation Work Permit',
      status: 'not-yet',
      reason: `Most PGWP applicants who applied for a study permit after November 1, 2024 must provide proof of English or French language results. ${verifiedNote}`,
    }
  }

  if (!fieldOk) {
    return {
      id: 'pgwp', name: 'Post-Graduation Work Permit',
      status: 'not-yet',
      reason: `Your program may need to match an eligible field of study (CIP code). For 2026, IRCC froze the eligible field-of-study list. ${verifiedNote}`,
    }
  }

  const gradDate = profile.graduationDate ? new Date(profile.graduationDate) : null
  const today = new Date()
  const monthsToGrad = gradDate ? Math.floor((gradDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)) : null

  return {
    id: 'pgwp', name: 'Post-Graduation Work Permit',
    status: 'possible',
    reason: monthsToGrad !== null && monthsToGrad <= 6
      ? `Graduation in ~${monthsToGrad} month${monthsToGrad !== 1 ? 's' : ''}. Apply for your PGWP before your study permit expires. Check DLI, program eligibility, language, and field-of-study requirements. ${verifiedNote}`
      : `PGWP eligibility depends on DLI, program eligibility, program length, language proof, and field of study if required. ${verifiedNote}`,
  }
}

// ─── Study Permit Extension ───────────────────────────────────────────────────

function assessStudyPermitExtension(profile: IntakeData): PathwayStatus | null {
  if (profile.status !== 'student') return null
  return {
    id: 'study-permit-extension', name: 'Study permit extension',
    status: 'possible',
    reason: 'Apply to extend your study permit at least 30 days before expiry. If changing schools, you need a new acceptance letter and must notify IRCC.',
  }
}

// ─── Visitor Pathways ─────────────────────────────────────────────────────────

function buildVisitorPathways(profile: IntakeData, fsw: FSWResult | null): PathwayStatus[] {
  if (profile.status !== 'visitor') return []
  const pathways: PathwayStatus[] = []

  pathways.push({
    id: 'visitor-status', name: 'Visitor status',
    status: 'possible',
    reason: 'Visitor status allows you to stay temporarily in Canada, but does not authorize work or long-term study unless separately permitted.',
  })

  // Temporary visitor-to-work-permit public policy ended August 28, 2024
  pathways.push({
    id: 'visitor-to-work-permit', name: 'Visitor → work permit',
    status: profile.canApplyInsideCanadaException === 'yes' ? 'possible' : 'not-applicable',
    reason: profile.canApplyInsideCanadaException === 'yes'
      ? 'You may fall under an inside-Canada work permit exception. Confirm the specific exception applies before applying.'
      : 'Most visitors cannot apply for a work permit from inside Canada. The temporary visitor-to-work-permit public policy ended August 28, 2024.',
  })

  pathways.push({
    id: 'visitor-to-study-permit', name: 'Visitor → study permit',
    status: profile.canApplyInsideCanadaException === 'yes' ? 'possible' : 'not-applicable',
    reason: profile.canApplyInsideCanadaException === 'yes'
      ? 'Some people can apply for a study permit from inside Canada. Confirm the applicable IRCC exception before applying.'
      : 'Study permits are generally applied for before coming to Canada. Most visitors cannot apply from inside Canada.',
  })

  if (profile.goal === 'pr') {
    pathways.push({
      id: 'visitor-to-pr', name: 'Visitor → PR',
      status: fsw?.eligible ? 'possible' : 'not-yet',
      reason: fsw?.eligible
        ? 'Visitor status does not block PR on its own. You may qualify through FSW if you meet all program requirements.'
        : 'Visitor status alone is not a PR pathway. Check FSW, PNP, or family sponsorship based on your full profile.',
    })
  }

  return pathways
}

// ─── Maintained Status ────────────────────────────────────────────────────────
// IRCC calls this "maintained status" — not "implied status"

function assessMaintainedStatus(profile: IntakeData): PathwayStatus | null {
  if (profile.appliedBeforeStatusExpiry !== 'yes') return null
  return {
    id: 'maintained-status', name: 'Maintained status',
    status: 'possible',
    reason: 'If you applied to extend or change your temporary status before it expired, you may remain in Canada while IRCC decides. Work or study rights depend on your previous permit conditions and the type of application you submitted.',
  }
}

// ─── Rural Community Immigration Class ───────────────────────────────────────
// Permanent program launched March 2024; replaced RNIP for participating communities.
// Requirements: job offer from designated employer, 1yr TEER 0-3 experience,
// CLB 4 (TEER 2-3), CLB 5 (TEER 1), CLB 6 (TEER 0), high school diploma minimum.

function assessRCIC(profile: IntakeData, clb: CLBScores | null, canMonths: number): PathwayStatus {
  const teer = profile.teerLevel
  const hasJobOffer = profile.hasJobOffer === 'yes'
  const foreignYears = parseFloat(profile.foreignWorkYears) || 0
  const totalWorkYears = foreignYears + (canMonths / 12)
  const hasWorkExp = totalWorkYears >= 1 && teer && ['0', '1', '2', '3'].includes(teer)
  const hasEducation = profile.educationLevel && profile.educationLevel !== 'none' && profile.educationLevel !== ''
  const notQuebec = profile.intendedProvince !== 'QC'

  // CLB minimums: TEER 0 → 6, TEER 1 → 5, TEER 2-3 → 4
  const minCLBRequired = teer === '0' ? 6 : teer === '1' ? 5 : 4
  const minCLB = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0
  const meetsLanguage = clb !== null && minCLB >= minCLBRequired

  if (!notQuebec) {
    return {
      id: 'rcic', name: 'Rural Community Immigration Class',
      status: 'not-applicable',
      reason: 'RCIC communities are outside Quebec. Quebec has its own rural immigration streams.',
    }
  }

  if (!hasJobOffer) {
    return {
      id: 'rcic', name: 'Rural Community Immigration Class',
      status: 'not-yet',
      reason: 'RCIC requires a full-time permanent job offer from a designated employer in a participating rural community. Without one, you cannot apply.',
    }
  }

  if (!hasWorkExp) {
    return {
      id: 'rcic', name: 'Rural Community Immigration Class',
      status: 'not-yet',
      reason: `RCIC requires at least 1 year of skilled work experience (TEER 0–3) in the last 3 years. ${teer && ['4','5'].includes(teer) ? 'TEER 4–5 occupations do not qualify.' : 'Accumulate the required experience before applying.'}`,
    }
  }

  if (!meetsLanguage) {
    const needed = minCLBRequired
    return {
      id: 'rcic', name: 'Rural Community Immigration Class',
      status: 'not-yet',
      reason: `Your TEER ${teer} occupation requires CLB ${needed} in all 4 language skills for RCIC. ${clb ? `Your current minimum is CLB ${minCLB}.` : 'Take a recognised language test first.'}`,
    }
  }

  if (!hasEducation) {
    return {
      id: 'rcic', name: 'Rural Community Immigration Class',
      status: 'not-yet',
      reason: 'RCIC requires at minimum a Canadian high school diploma or foreign equivalent. Complete your education or obtain an ECA.',
    }
  }

  return {
    id: 'rcic', name: 'Rural Community Immigration Class',
    status: 'eligible',
    reason: 'You appear to meet the core RCIC requirements: job offer, work experience, language, and education. Confirm the community is on the official IRCC participating-communities list and that your employer is designated before applying.',
  }
}

// ─── Work Permit Pathways ─────────────────────────────────────────────────────

function buildWorkerPathways(profile: IntakeData, cecEligible: boolean, canMonths: number): PathwayStatus[] {
  if (profile.status !== 'work-permit') return []
  const pathways: PathwayStatus[] = []

  const expiry = profile.permitExpiry ? new Date(profile.permitExpiry + '-01') : null
  const daysToExpiry = expiry ? Math.floor((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  pathways.push({
    id: 'work-permit-extension', name: 'Work permit extension',
    status: daysToExpiry !== null && daysToExpiry <= 90 ? 'not-yet' : 'possible',
    reason: daysToExpiry !== null && daysToExpiry <= 90
      ? `Your permit expires in ~${daysToExpiry} days. Apply to extend immediately. File at least 30 days before expiry to maintain legal status.`
      : profile.workPermitType === 'closed'
      ? 'Closed work permits are employer-specific. To change employers, you need a new work permit. Consider switching to an open work permit if eligible.'
      : 'Apply to extend your work permit before it expires. Filing 3+ months in advance is recommended.',
  })

  if (cecEligible || canMonths >= 9) {
    pathways.push({
      id: 'bridging-owp', name: 'Bridging Open Work Permit (BOWP)',
      status: 'possible',
      reason: 'If you have applied for PR and your work permit expires before a decision, you may qualify for a Bridging OWP. You must have applied for PR under CEC/FSW/FST and your permit must expire within 4 months.',
    })
  }

  return pathways
}

// ─── Risk Flags — 2026 ────────────────────────────────────────────────────────

function buildRiskFlags(profile: IntakeData): RiskFlag[] {
  const flags: RiskFlag[] = []

  if (profile.lostStatus === 'yes') {
    flags.push({
      level: 'critical',
      message: 'You reported a loss of status, overstay, or status problem. This can create refusal or inadmissibility risk. Get advice from a licensed RCIC or immigration lawyer before submitting any application.',
    })
  }

  if (profile.previousRefusals === 'yes') {
    flags.push({
      level: 'warning',
      message: 'You reported a previous refusal. Previous refusals must be disclosed. Your next application should directly address the reasons for that refusal.',
    })
  }

  if (
    profile.status === 'visitor' &&
    (profile.goal === 'work' || profile.goal === 'work-permit') &&
    profile.canApplyInsideCanadaException !== 'yes'
  ) {
    flags.push({
      level: 'warning',
      message: 'Most visitors cannot apply for a work permit from inside Canada. The temporary visitor-to-work-permit public policy ended August 28, 2024. Do not work without authorization.',
    })
  }

  if (profile.status === 'student' && profile.canadianWorkWhileFullTimeStudent === 'yes') {
    flags.push({
      level: 'warning',
      message: 'Work gained while studying full-time generally should not be counted toward the CEC 1-year requirement. Only post-graduation work on a PGWP or other work permit typically counts.',
    })
  }

  if (!profile.settlementFunds && profile.goal === 'pr' && profile.status !== 'student' && profile.hasJobOffer !== 'yes') {
    flags.push({
      level: 'warning',
      message: 'Settlement funds are not entered. FSW normally requires proof of funds unless you are exempt (authorized to work in Canada with a valid job offer).',
    })
  }

  return flags
}

// ─── Age — computed from birthYear+birthMonth when available ──────────────────
// Falls back to the manually entered age string for profiles that predate this field.
// This ensures age updates automatically when a birthday passes rather than staying
// frozen at whatever number the user typed during onboarding.

export function computeAge(profile: IntakeData): number {
  const year = parseInt(profile.birthYear)
  const month = parseInt(profile.birthMonth) // 1-based (January = 1)
  if (year >= 1920 && year <= 2010 && month >= 1 && month <= 12) {
    const today = new Date()
    let age = today.getFullYear() - year
    // If the birth month is still ahead this calendar year, subtract 1
    if (today.getMonth() + 1 < month) age--
    return Math.max(0, age)
  }
  return parseInt(profile.age) || 0
}

// ─── Main Score Calculator ────────────────────────────────────────────────────

export function calculateScore(profile: IntakeData): ScoreResult {
  const missing: string[] = []

  const age = computeAge(profile)
  if (!age || age < 18) missing.push('Age')

  const spouseComing =
    (profile.maritalStatus === 'married' || profile.maritalStatus === 'common-law') &&
    profile.spouseComing === 'yes'

  const rawLang: CLBScores = {
    r: parseFloat(profile.langReading),
    w: parseFloat(profile.langWriting),
    l: parseFloat(profile.langListening),
    s: parseFloat(profile.langSpeaking),
  }
  const clb = convertToCLB(profile.langTestType, rawLang)
  if (!clb) missing.push('Language test scores')

  const rawFrench: CLBScores = {
    r: parseFloat(profile.frenchReading),
    w: parseFloat(profile.frenchWriting),
    l: parseFloat(profile.frenchListening),
    s: parseFloat(profile.frenchSpeaking),
  }
  const frenchClb = convertToCLB(profile.frenchTestType, rawFrench)

  if (!profile.educationLevel) missing.push('Education level')

  const riskFlags = buildRiskFlags(profile)

  if (missing.length > 0) {
    return { clb, crs: null, fsw: null, pathways: [], improvements: [], riskFlags, hasEnoughData: false, missingFields: missing }
  }

  const foreignYears = parseFloat(profile.foreignWorkYears) || 0
  const canMonths = parseFloat(profile.canadianWorkMonths) || 0
  const minCLB = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0

  // ── CRS Core ──
  const langTotal = clb
    ? firstLangPts(clb.r, spouseComing) + firstLangPts(clb.w, spouseComing) +
      firstLangPts(clb.l, spouseComing) + firstLangPts(clb.s, spouseComing)
    : 0

  const frenchBonus = secondLangPts(frenchClb, clb)
  const spouseFactors = calculateSpouseFactors(profile)
  const pnpNomination = profile.pnpNomination === 'yes'

  const breakdown: CRSBreakdown = {
    age: agePts(age, spouseComing),
    education: educationPts(profile.educationLevel, spouseComing),
    firstLanguage: langTotal,
    secondLanguage: frenchBonus,
    spouseFactors,
    canadianExperience: canadianWorkPts(canMonths, spouseComing),
    skillTransferability: skillTransferabilityPts(profile.educationLevel, clb, foreignYears, canMonths),
    // Job offer no longer adds CRS points as of March 25, 2025
    additional: additionalPts(profile.canadianEducation, profile.canadianSibling, pnpNomination),
    total: 0,
  }
  breakdown.total = breakdown.age + breakdown.education + breakdown.firstLanguage +
    breakdown.secondLanguage + breakdown.spouseFactors + breakdown.canadianExperience +
    breakdown.skillTransferability + breakdown.additional

  // ── FSW 67/100 ──
  const fsw = assessFSW(profile, clb, age)

  // ── Pathway eligibility ──
  const pathways: PathwayStatus[] = []
  const canYears = Math.floor(canMonths / 12)

  // CEC
  const cecResult = assessCEC(profile, clb, canMonths)
  pathways.push(cecResult)
  const cecEligible = cecResult.status === 'eligible'

  // FSW
  pathways.push({
    id: 'fsw',
    name: 'Federal Skilled Worker',
    status: fsw.eligible ? 'eligible' : (minCLB >= 7 && fsw.score >= 50) ? 'possible' : 'not-yet',
    reason: fsw.eligible
      ? `${fsw.score}/100 — above the 67-point threshold.`
      : !fsw.meetsWorkRequirement
      ? 'Need 1+ year of continuous TEER 0/1/2/3 skilled work experience.'
      : minCLB < 7
      ? 'Language must be CLB 7+ in all 4 skills for FSW.'
      : !fsw.meetsMinFunds && profile.settlementFunds
      ? `Settlement funds below the minimum required for FSW.`
      : `${fsw.score}/100 — below 67-point pass mark.`,
  })

  // FST
  pathways.push(assessFST(profile, clb, foreignYears))

  // PNP
  pathways.push({
    id: 'pnp',
    name: 'Provincial Nominee Program',
    status: 'possible',
    reason: profile.intendedProvince && profile.intendedProvince !== 'Any'
      ? `Check ${profile.intendedProvince} PNP streams for your NOC${profile.noc ? ` (${profile.noc})` : ''} and work profile. PNP rules change frequently — verify at the provincial website.`
      : 'PNP eligibility depends on target province, occupation, work history, education, and status. A job offer may strengthen some PNP streams.',
  })

  // Rural Community Immigration Class (permanent program since March 2024)
  pathways.push(assessRCIC(profile, clb, canMonths))

  // Student pathways
  const pgwpResult = assessPGWP(profile)
  if (pgwpResult) pathways.push(pgwpResult)
  const studyExtension = assessStudyPermitExtension(profile)
  if (studyExtension) pathways.push(studyExtension)

  // Visitor pathways
  const visitorPathways = buildVisitorPathways(profile, fsw)
  pathways.push(...visitorPathways)

  // Worker pathways
  const workerPathways = buildWorkerPathways(profile, cecEligible, canMonths)
  pathways.push(...workerPathways)

  // Maintained status (replaces old "implied status")
  const maintainedStatus = assessMaintainedStatus(profile)
  if (maintainedStatus) pathways.push(maintainedStatus)

  // ── Improvements ──
  const improvements: Improvement[] = []

  if (clb) {
    const minL = Math.min(clb.r, clb.w, clb.l, clb.s)
    if (minL < 7) {
      improvements.push({
        label: 'Reach CLB 7 in all four language skills',
        impact: 'Required for FSW and most PNP streams',
        action: 'CLB 7 is the minimum threshold for Express Entry. On IELTS General, this means roughly R:6.0 W:6.0 L:6.0 S:6.0.',
      })
    } else if (minL < 9) {
      const projected = [9,9,9,9].reduce((s,c) => s + firstLangPts(c, spouseComing), 0)
      const gain = projected - langTotal
      if (gain > 0) {
        improvements.push({
          label: 'Improve language to CLB 9 in all skills',
          impact: `+${gain} CRS`,
          action: 'Retake your test targeting CLB 9 in all 4 skills. Each skill is scored independently — focus on your weakest one first.',
        })
      }
    } else if (minL === 9) {
      const projected = [10,10,10,10].reduce((s,c) => s + firstLangPts(c, spouseComing), 0)
      const gain = projected - langTotal
      improvements.push({
        label: 'Push language to CLB 10 in all skills',
        impact: `+${gain} CRS`,
        action: 'You are at CLB 9. Pushing all 4 skills to CLB 10 earns the maximum language score.',
      })
    }
  }

  if (canYears < 1) {
    const gain = canadianWorkPts(12, spouseComing) - breakdown.canadianExperience
    improvements.push({
      label: 'Gain 12 months of authorized skilled Canadian work',
      impact: `+${gain} CRS`,
      action: 'Work full-time in a TEER 0, 1, 2, or 3 occupation. This also unlocks Canadian Experience Class.',
    })
  } else if (canYears < 2) {
    const gain = canadianWorkPts(24, spouseComing) - breakdown.canadianExperience
    improvements.push({
      label: 'Complete 2 years of Canadian skilled work',
      impact: `+${gain} CRS`,
      action: 'Continue in your current TEER 0–3 role to reach the 2-year milestone.',
    })
  } else if (canYears < 3) {
    const gain = canadianWorkPts(36, spouseComing) - breakdown.canadianExperience
    improvements.push({
      label: 'Complete 3 years of Canadian skilled work',
      impact: `+${gain} CRS`,
      action: 'Reaching 3 years adds more Canadian experience points.',
    })
  }

  if (profile.canadianEducation === 'none' || !profile.canadianEducation) {
    improvements.push({
      label: 'Add a Canadian education credential',
      impact: '+15 to +30 CRS',
      action: 'A 1–2 year Canadian program adds 15 CRS points; a 3+ year program or graduate degree adds 30 points.',
    })
  }

  // Settlement funds only required for FSW — students and work permit holders with a job offer are exempt
  const fswFundsNeeded =
    !profile.settlementFunds &&
    profile.goal === 'pr' &&
    profile.status !== 'student' &&
    profile.hasJobOffer !== 'yes'
  if (fswFundsNeeded) {
    const familySize = parseInt(profile.familySize) || 1
    const requiredFunds = getRequiredFunds(familySize)
    improvements.push({
      label: 'Confirm your settlement funds',
      impact: 'FSW eligibility',
      action: `FSW requires proof of settlement funds. For a family of ${familySize}, you need at least $${requiredFunds.toLocaleString()} CAD. Update your profile with your available funds.`,
    })
  }

  return { clb, crs: breakdown, fsw, pathways, improvements, riskFlags, hasEnoughData: true, missingFields: [] }
}
