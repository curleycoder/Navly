import type { IntakeData } from './profile'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CLBScores = { r: number; w: number; l: number; s: number }

export type CRSBreakdown = {
  age: number
  education: number
  firstLanguage: number
  canadianExperience: number
  skillTransferability: number
  additional: number
  total: number
}

export type FSWResult = {
  score: number
  eligible: boolean
  meetsWorkRequirement: boolean
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
  status: 'eligible' | 'not-yet' | 'possible' | 'not-applicable'
  reason: string
}

export type Improvement = {
  label: string
  impact: string
  action: string
}

export type ScoreResult = {
  clb: CLBScores | null
  crs: CRSBreakdown | null
  fsw: FSWResult | null
  pathways: PathwayStatus[]
  improvements: Improvement[]
  hasEnoughData: boolean
  missingFields: string[]
}

// ─── CLB Conversion ───────────────────────────────────────────────────────────

function ieltsToCLB(scores: CLBScores): CLBScores {
  const tables: Record<keyof CLBScores, [number, number][]> = {
    r: [[8.0,10],[7.0,9],[6.5,8],[6.0,7],[5.0,6],[4.0,5],[3.5,4]],
    w: [[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
    l: [[8.5,10],[8.0,9],[7.5,8],[6.0,7],[5.5,6],[5.0,5],[4.5,4]],
    s: [[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
  }
  function convert(score: number, skill: keyof CLBScores): number {
    for (const [min, clb] of tables[skill]) {
      if (score >= min) return clb
    }
    return 3
  }
  return { r: convert(scores.r,'r'), w: convert(scores.w,'w'), l: convert(scores.l,'l'), s: convert(scores.s,'s') }
}

function celpipToCLB(scores: CLBScores): CLBScores {
  // CELPIP score directly equals CLB level, capped at 10
  const cap = (n: number) => Math.min(Math.max(Math.floor(n), 3), 10)
  return { r: cap(scores.r), w: cap(scores.w), l: cap(scores.l), s: cap(scores.s) }
}

function pteToCLB(scores: CLBScores): CLBScores {
  function reading(s: number) {
    if (s >= 88) return 10; if (s >= 78) return 9; if (s >= 60) return 8
    if (s >= 51) return 7;  if (s >= 33) return 6; if (s >= 23) return 5
    if (s >= 20) return 4;  return 3
  }
  function writing(s: number) {
    if (s >= 90) return 10; if (s >= 79) return 9; if (s >= 69) return 8
    if (s >= 60) return 7;  if (s >= 51) return 6; if (s >= 41) return 5
    if (s >= 32) return 4;  return 3
  }
  function listening(s: number) {
    if (s >= 82) return 10; if (s >= 71) return 9; if (s >= 60) return 8
    if (s >= 46) return 7;  if (s >= 31) return 6; if (s >= 21) return 5
    if (s >= 18) return 4;  return 3
  }
  function speaking(s: number) {
    if (s >= 89) return 10; if (s >= 76) return 9; if (s >= 68) return 8
    if (s >= 59) return 7;  if (s >= 51) return 6; if (s >= 41) return 5
    if (s >= 30) return 4;  return 3
  }
  return { r: reading(scores.r), w: writing(scores.w), l: listening(scores.l), s: speaking(scores.s) }
}

export function convertToCLB(testType: string, scores: CLBScores): CLBScores | null {
  if (!testType || testType === 'none') return null
  const { r, w, l, s } = scores
  if (isNaN(r) || isNaN(w) || isNaN(l) || isNaN(s)) return null
  if (testType === 'ielts-general') return ieltsToCLB(scores)
  if (testType === 'celpip') return celpipToCLB(scores)
  if (testType === 'pte') return pteToCLB(scores)
  return null
}

// ─── CRS — First Language Points ─────────────────────────────────────────────

function firstLangPts(clb: number, spouseComing: boolean): number {
  if (!spouseComing) {
    if (clb >= 10) return 34; if (clb === 9) return 31; if (clb === 8) return 23
    if (clb === 7) return 17; if (clb === 6) return 9;  if (clb >= 4) return 6
    return 0
  } else {
    if (clb >= 10) return 32; if (clb === 9) return 29; if (clb === 8) return 22
    if (clb === 7) return 16; if (clb === 6) return 8;  if (clb >= 4) return 6
    return 0
  }
}

// ─── CRS — Age Points ─────────────────────────────────────────────────────────

function agePts(age: number, spouseComing: boolean): number {
  if (!spouseComing) {
    if (age >= 20 && age <= 29) return 110
    if (age === 19) return 105; if (age === 18) return 99
    if (age === 30) return 105; if (age === 31) return 99; if (age === 32) return 94
    if (age === 33) return 88;  if (age === 34) return 83; if (age === 35) return 77
    if (age === 36) return 72;  if (age === 37) return 66; if (age === 38) return 61
    if (age === 39) return 55;  if (age === 40) return 50; if (age === 41) return 39
    if (age === 42) return 28;  if (age === 43) return 17; if (age === 44) return 6
    return 0
  } else {
    if (age >= 20 && age <= 29) return 100
    if (age === 19) return 95;  if (age === 18) return 90
    if (age === 30) return 95;  if (age === 31) return 90; if (age === 32) return 85
    if (age === 33) return 80;  if (age === 34) return 75; if (age === 35) return 70
    if (age === 36) return 65;  if (age === 37) return 60; if (age === 38) return 55
    if (age === 39) return 50;  if (age === 40) return 45; if (age === 41) return 35
    if (age === 42) return 25;  if (age === 43) return 15; if (age === 44) return 5
    return 0
  }
}

// ─── CRS — Education Points ───────────────────────────────────────────────────

function educationPts(level: string, spouseComing: boolean): number {
  // Same table for both spouse/no-spouse in principal applicant core factor
  const map: Record<string, number> = {
    'less-than-secondary': 0, secondary: 28,
    '1-year': 84, '2-year': 91, bachelors: 112,
    'two-credentials': 119, masters: 126, doctoral: 140,
  }
  if (spouseComing) {
    // With spouse, principal applicant education cap is lower
    const spouseMap: Record<string, number> = {
      'less-than-secondary': 0, secondary: 28,
      '1-year': 84, '2-year': 91, bachelors: 112,
      'two-credentials': 119, masters: 126, doctoral: 140,
    }
    return spouseMap[level] ?? 0
  }
  return map[level] ?? 0
}

// ─── CRS — Canadian Work Experience ──────────────────────────────────────────

function canadianWorkPts(months: number, spouseComing: boolean): number {
  const years = Math.min(Math.floor(months / 12), 5)
  const noSpouse = [0, 40, 53, 64, 72, 80]
  const withSpouse = [0, 35, 46, 56, 63, 70]
  return (spouseComing ? withSpouse : noSpouse)[years]
}

// ─── CRS — Skill Transferability ─────────────────────────────────────────────

function skillTransferabilityPts(
  educationLevel: string,
  clb: CLBScores | null,
  foreignWorkYears: number,
  canadianWorkMonths: number,
): number {
  const minLang = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0
  const canYears = Math.floor(canadianWorkMonths / 12)
  const hasCLB7 = minLang >= 7
  const hasCLB9 = minLang >= 9
  const advEdu = ['bachelors','two-credentials','masters','doctoral'].includes(educationLevel)
  const anyPost = ['1-year','2-year','bachelors','two-credentials','masters','doctoral'].includes(educationLevel)

  let total = 0

  // Education + Language (max 50)
  let el = 0
  if (advEdu && hasCLB9) el = 50
  else if (advEdu && hasCLB7) el = 25
  else if (anyPost && hasCLB9) el = 25
  else if (anyPost && hasCLB7) el = 13
  total += Math.min(el, 50)

  // Education + Canadian experience (max 50)
  let ec = 0
  if (advEdu && canYears >= 2) ec = 50
  else if (advEdu && canYears >= 1) ec = 25
  else if (anyPost && canYears >= 2) ec = 25
  else if (anyPost && canYears >= 1) ec = 13
  total += Math.min(ec, 50)

  // Foreign work + Language (max 50)
  let fl = 0
  if (foreignWorkYears >= 3 && hasCLB9) fl = 50
  else if (foreignWorkYears >= 3 && hasCLB7) fl = 25
  else if (foreignWorkYears >= 1 && hasCLB9) fl = 25
  else if (foreignWorkYears >= 1 && hasCLB7) fl = 13
  total += Math.min(fl, 50)

  // Foreign work + Canadian experience (max 50)
  let fc = 0
  if (foreignWorkYears >= 3 && canYears >= 2) fc = 50
  else if (foreignWorkYears >= 3 && canYears >= 1) fc = 25
  else if (foreignWorkYears >= 1 && canYears >= 2) fc = 25
  else if (foreignWorkYears >= 1 && canYears >= 1) fc = 13
  total += Math.min(fc, 50)

  return Math.min(total, 100)
}

// ─── CRS — Additional Points ──────────────────────────────────────────────────

function additionalPts(
  hasJobOffer: boolean,
  teerLevel: string,
  canadianEducation: string,
): number {
  let pts = 0
  if (hasJobOffer) {
    if (teerLevel === '0') pts += 200
    else if (['1','2','3'].includes(teerLevel)) pts += 50
    else pts += 25
  }
  if (canadianEducation === '3-plus-year') pts += 30
  else if (canadianEducation === '1-2-year') pts += 15
  return pts
}

// ─── FSW 67/100 ───────────────────────────────────────────────────────────────

function fswLangPts(clb: CLBScores | null): number {
  if (!clb) return 0
  const minCLB = Math.min(clb.r, clb.w, clb.l, clb.s)
  if (minCLB < 7) return 0 // CLB 7 minimum in all 4 skills
  const per = (c: number) => c >= 9 ? 6 : c === 8 ? 5 : 4
  return per(clb.r) + per(clb.w) + per(clb.l) + per(clb.s)
}

function fswEduPts(level: string): number {
  const map: Record<string, number> = {
    'less-than-secondary': 0, secondary: 5, '1-year': 15, '2-year': 19,
    bachelors: 21, 'two-credentials': 22, masters: 23, doctoral: 25,
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

// ─── Main Score Calculator ────────────────────────────────────────────────────

export function calculateScore(profile: IntakeData): ScoreResult {
  const missing: string[] = []

  const age = parseInt(profile.age)
  if (isNaN(age) || age < 18) missing.push('Age')

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

  if (!profile.educationLevel) missing.push('Education level')

  if (missing.length > 0) {
    return { clb, crs: null, fsw: null, pathways: [], improvements: [], hasEnoughData: false, missingFields: missing }
  }

  const foreignYears = parseFloat(profile.foreignWorkYears) || 0
  const canMonths = parseFloat(profile.canadianWorkMonths) || 0
  const teer = profile.teerLevel
  const jobOffer = profile.hasJobOffer === 'yes'

  // ── CRS Core ──
  const langTotal = clb!
    ? firstLangPts(clb!.r, spouseComing) + firstLangPts(clb!.w, spouseComing) +
      firstLangPts(clb!.l, spouseComing) + firstLangPts(clb!.s, spouseComing)
    : 0

  const breakdown: CRSBreakdown = {
    age: agePts(age, spouseComing),
    education: educationPts(profile.educationLevel, spouseComing),
    firstLanguage: langTotal,
    canadianExperience: canadianWorkPts(canMonths, spouseComing),
    skillTransferability: skillTransferabilityPts(profile.educationLevel, clb, foreignYears, canMonths),
    additional: additionalPts(jobOffer, teer, profile.canadianEducation),
    total: 0,
  }
  breakdown.total = breakdown.age + breakdown.education + breakdown.firstLanguage +
    breakdown.canadianExperience + breakdown.skillTransferability + breakdown.additional

  // ── FSW 67/100 ──
  const minCLB = clb ? Math.min(clb.r, clb.w, clb.l, clb.s) : 0
  const fswLang = fswLangPts(clb)
  const fswEdu = fswEduPts(profile.educationLevel)
  const fswWork = fswWorkPts(foreignYears)
  const fswAge = fswAgePts(age)
  const fswJob = jobOffer ? 10 : 0
  const fswAdapt = canMonths >= 12 ? 10 : (profile.canadianEducation !== '' && profile.canadianEducation !== 'none' ? 5 : 0)
  const fswTotal = fswLang + fswEdu + fswWork + fswAge + fswJob + fswAdapt
  const meetsWorkReq = foreignYears >= 1 && (teer === '0' || teer === '1' || teer === '2' || teer === '3')

  const fsw: FSWResult = {
    score: fswTotal,
    eligible: meetsWorkReq && minCLB >= 7 && fswTotal >= 67,
    meetsWorkRequirement: meetsWorkReq,
    breakdown: { language: fswLang, education: fswEdu, workExperience: fswWork, age: fswAge, jobOffer: fswJob, adaptability: fswAdapt },
  }

  // ── Pathway eligibility ──
  const pathways: PathwayStatus[] = []
  const canYears = Math.floor(canMonths / 12)
  const cecMinCLB = (teer === '0' || teer === '1') ? 7 : 5
  const cecEligible = canMonths >= 12 && ['0','1','2','3'].includes(teer) && minCLB >= cecMinCLB
  const cecMonthsLeft = Math.max(0, 12 - canMonths)

  pathways.push({
    id: 'cec',
    name: 'Canadian Experience Class',
    status: cecEligible ? 'eligible' : (canMonths > 0 && teer && ['0','1','2','3'].includes(teer)) ? 'not-yet' : 'not-applicable',
    reason: cecEligible
      ? 'You meet the 12-month Canadian skilled work requirement.'
      : cecMonthsLeft > 0 && ['0','1','2','3'].includes(teer)
      ? `${Math.ceil(cecMonthsLeft)} more months of TEER ${teer} work needed.`
      : 'No Canadian skilled work experience on record.',
  })

  pathways.push({
    id: 'fsw',
    name: 'Federal Skilled Worker',
    status: fsw.eligible ? 'eligible' : (minCLB >= 7 && fswTotal >= 50) ? 'possible' : 'not-yet',
    reason: fsw.eligible
      ? `${fswTotal}/100 — above the 67-point threshold.`
      : !meetsWorkReq
      ? 'Need 1+ year of TEER 0/1/2/3 skilled work experience.'
      : minCLB < 7
      ? 'Language must be CLB 7+ in all 4 skills.'
      : `${fswTotal}/100 — below 67-point pass mark.`,
  })

  pathways.push({
    id: 'pnp',
    name: 'Provincial Nominee Program',
    status: 'possible',
    reason: profile.intendedProvince
      ? `Check ${profile.intendedProvince} PNP streams for your NOC and work profile.`
      : 'Depends on target province, job offer, and occupation.',
  })

  if (profile.status === 'student') {
    const pgwpLikely = ['college-diploma','bachelor','master','doctoral'].includes(profile.programLevel) &&
      parseFloat(profile.programLengthMonths) >= 8
    pathways.push({
      id: 'pgwp',
      name: 'PGWP → CEC pathway',
      status: pgwpLikely ? 'possible' : 'not-yet',
      reason: pgwpLikely
        ? 'After graduation, 12 months of TEER 0–3 work qualifies you for CEC.'
        : 'Confirm your program is PGWP-eligible (8+ months at a DLI).',
    })
  }

  // ── Improvements ──
  const improvements: Improvement[] = []

  if (clb) {
    const minL = Math.min(clb.r, clb.w, clb.l, clb.s)
    if (minL < 9) {
      const current = langTotal
      const projected = [9,9,9,9].reduce((s,c) => s + firstLangPts(c, spouseComing), 0)
      const gain = projected - current
      if (gain > 0) {
        improvements.push({
          label: 'Improve language to CLB 9',
          impact: `+${gain} CRS`,
          action: 'Retake your test targeting CLB 9 in all 4 skills. Each skill is scored independently.',
        })
      }
    } else if (minL === 9) {
      const current = langTotal
      const projected = [10,10,10,10].reduce((s,c) => s + firstLangPts(c, spouseComing), 0)
      const gain = projected - current
      improvements.push({
        label: 'Push language to CLB 10',
        impact: `+${gain} CRS`,
        action: 'You are already at CLB 9. Pushing all 4 skills to CLB 10 gives the maximum language score.',
      })
    }
  }

  if (canYears < 1) {
    const gain = canadianWorkPts(12, spouseComing) - breakdown.canadianExperience
    improvements.push({
      label: 'Gain 12 months of skilled Canadian work',
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

  if (!jobOffer && teer && ['1','2','3'].includes(teer)) {
    improvements.push({
      label: 'Secure a valid job offer',
      impact: '+50 CRS',
      action: 'A permanent offer from a Canadian employer (LMIA-backed or LMIA-exempt) adds 50 points for TEER 1–3.',
    })
  }

  if (profile.canadianEducation === 'none' || !profile.canadianEducation) {
    improvements.push({
      label: 'Add Canadian education credential',
      impact: '+15 to +30 CRS',
      action: 'A 1–2 year Canadian program adds 15 points; a 3+ year program or graduate degree adds 30 points.',
    })
  }

  return { clb, crs: breakdown, fsw, pathways, improvements, hasEnoughData: true, missingFields: [] }
}
