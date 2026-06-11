/**
 * PNP Stream Matching Engine
 * Matches a user's profile against the main streams for each province.
 * All thresholds reflect 2025/2026 IRCC/PNP program guidelines.
 * This is for planning purposes only — always verify at the official provincial website.
 */
import type { IntakeData } from './profile'
import { convertToCLB } from './scoring'

export type PNPStreamStatus = 'eligible' | 'possible' | 'not-yet' | 'not-applicable'

export type ReadinessItem = {
  label: string
  met: boolean
  warning?: string   // shown when met=true but with a caveat
}

export type PNPStream = {
  id: string
  province: string         // full name, e.g. 'British Columbia'
  provinceCode: string     // 2-letter code
  programName: string      // e.g. 'BC Skills Immigration'
  streamName: string
  status: PNPStreamStatus
  reason: string           // one-line summary
  missingItems: string[]   // actionable missing requirements
  score?: number           // estimated points on the province's own scoring grid (or strength indicator)
  maxScore?: number        // maximum possible points on that grid
  scoreLabel?: string      // overrides the default score label in the UI
  readinessItems?: ReadinessItem[]  // checklist display — used instead of score bar when present
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function minCLB(profile: IntakeData): number {
  const raw = {
    r: parseFloat(profile.langReading),
    w: parseFloat(profile.langWriting),
    l: parseFloat(profile.langListening),
    s: parseFloat(profile.langSpeaking),
  }
  const clb = convertToCLB(profile.langTestType, raw)
  if (!clb) return 0
  return Math.min(clb.r, clb.w, clb.l, clb.s)
}

function isSkilled(teer: string): boolean {
  return ['0', '1', '2', '3'].includes(teer)
}

function canMonths(profile: IntakeData): number {
  return parseFloat(profile.canadianWorkMonths) || 0
}

function foreignYears(profile: IntakeData): number {
  return parseFloat(profile.foreignWorkYears) || 0
}

function inProvince(profile: IntakeData, code: string): boolean {
  const p = (profile.province || '').toUpperCase()
  return p === code || p.startsWith(code)
}

// ─── BC Skills Immigration (BCPNP) ───────────────────────────────────────────
// BC uses a 200-point grid. Draws set a cut-off (typically 60–100); scores above it receive an invitation.
// Factor breakdown: job offer/BC work (max 100) + experience (max 25) + education (max 25) + language (max 20) + adaptability (max 30).
// Source: bcpnp.ca skills immigration registration system (verified June 2026).

function computeBCScore(profile: IntakeData): { score: number; maxScore: number } {
  const clb = minCLB(profile)
  const teer = profile.teerLevel
  const hasOffer = profile.hasJobOffer === 'yes'
  const inBC = inProvince(profile, 'BC')
  const months = canMonths(profile)
  const totalYears = foreignYears(profile) + months / 12
  let pts = 0

  // Job offer / BC work experience (max 100)
  if (hasOffer) {
    if (teer === '0')      pts += 100
    else if (teer === '1') pts += 90
    else if (teer === '2') pts += 80
    else                   pts += 75
  } else if (inBC && months >= 12) pts += 60
  else if (inBC && months >= 9)   pts += 50

  // Work experience (max 25)
  if (totalYears >= 3)     pts += 25
  else if (totalYears >= 2) pts += 20
  else if (totalYears >= 1) pts += 15
  else if (totalYears >= 0.5) pts += 10

  // Education (max 25)
  if (['doctoral', 'masters'].includes(profile.educationLevel))       pts += 25
  else if (profile.educationLevel === 'bachelors')                     pts += 20
  else if (profile.educationLevel === 'two-credentials')               pts += 18
  else if (profile.educationLevel === '2-year')                        pts += 15
  else if (profile.educationLevel === '1-year')                        pts += 10
  else if (profile.educationLevel === 'secondary')                     pts += 5

  // Language (max 20)
  if (clb >= 9)      pts += 20
  else if (clb >= 8) pts += 15
  else if (clb >= 7) pts += 10
  else if (clb >= 5) pts += 5

  // Adaptability / regional connection (max 30)
  if (inBC && months >= 12) pts += 20
  else if (inBC && months >= 6) pts += 12
  else if (inBC) pts += 6

  return { score: Math.min(pts, 200), maxScore: 200 }
}

function bcStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const months = canMonths(profile)
  const hasBCWork = inProvince(profile, 'BC') && months >= 9
  const hasBCEdu = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' && inProvince(profile, 'BC')
  const isStudent = profile.status === 'student'

  const streams: PNPStream[] = []
  const bcScore = computeBCScore(profile)

  // --- Skilled Worker (non-EE) ---
  const swMissing: string[] = []
  if (!hasOffer) swMissing.push('Job offer from a BC employer')
  if (!skilled) swMissing.push('TEER 0–3 occupation')
  if (clb < 4) swMissing.push('Language score of CLB 4+ in all skills')
  streams.push({
    id: 'bc-skilled-worker',
    province: 'British Columbia',
    provinceCode: 'BC',
    programName: 'BC Skills Immigration',
    streamName: 'Skilled Worker',
    status: swMissing.length === 0 ? 'eligible' : swMissing.length <= 1 ? 'possible' : 'not-yet',
    reason: swMissing.length === 0
      ? 'You appear to meet the BC Skilled Worker requirements.'
      : `Missing: ${swMissing[0]}${swMissing.length > 1 ? ` (+${swMissing.length - 1} more)` : ''}.`,
    missingItems: swMissing,
    ...bcScore,
  })

  // --- International Graduate ---
  const igMissing: string[] = []
  if (!isStudent && !hasBCEdu) igMissing.push('Graduation from a BC post-secondary institution (within 3 years)')
  if (clb < 4) igMissing.push('Language score of CLB 4+ in all skills')
  // Job offer not required for some IG streams, but preferred
  streams.push({
    id: 'bc-intl-graduate',
    province: 'British Columbia',
    provinceCode: 'BC',
    programName: 'BC Skills Immigration',
    streamName: 'International Graduate',
    status: igMissing.length === 0 ? 'possible' : 'not-yet',
    reason: igMissing.length === 0
      ? 'You may qualify if you recently graduated from a BC post-secondary program.'
      : `Missing: ${igMissing.join('; ')}.`,
    missingItems: igMissing,
  })

  // --- Express Entry BC ---
  const eeMissing: string[] = []
  if (!hasOffer && !hasBCWork) eeMissing.push('Job offer from a BC employer, or 9+ months of BC work experience')
  if (!skilled) eeMissing.push('TEER 0–3 occupation')
  if (clb < 4) eeMissing.push('CLB 4+ language score')
  streams.push({
    id: 'bc-express-entry',
    province: 'British Columbia',
    provinceCode: 'BC',
    programName: 'BC Skills Immigration',
    streamName: 'Express Entry BC',
    status: eeMissing.length === 0 ? 'possible' : eeMissing.length === 1 ? 'possible' : 'not-yet',
    reason: eeMissing.length === 0
      ? 'You may be invited from the Express Entry pool via BC PNP (adds 600 CRS points).'
      : `Missing: ${eeMissing[0]}${eeMissing.length > 1 ? ` (+${eeMissing.length - 1} more)` : ''}.`,
    missingItems: eeMissing,
    ...bcScore,
  })

  return streams
}

// ─── Ontario OINP ─────────────────────────────────────────────────────────────
// OINP has no public points grid. Connection strength reflects the factors Ontario
// weighs internally: job offer (dominant), ON work/study, NOC priority alignment.
// Priority NOC clusters: tech, regulated healthcare, skilled trades (verified June 2026).

const ON_PRIORITY_NOCS = new Set([
  // Tech
  '20012','21211','21220','21221','21222','21223','21230','21231','21232','21233','21234','21311',
  // Regulated healthcare
  '31100','31101','31102','31111','31120','31121','31200','31201','31202','31203','31204',
  '31301','31302','32101','32102','32103','33100','33101','33102','33103',
  // Skilled trades
  '72010','72011','72100','72101','72102','72200','72201','72202','72203',
  '72301','72302','72400','72401','73200','73201','73202','73300','73400',
])

function computeONStrength(profile: IntakeData): { score: number; maxScore: number; scoreLabel: string } {
  const hasOffer  = profile.hasJobOffer === 'yes'
  const inON      = inProvince(profile, 'ON')
  const months    = canMonths(profile)
  const hasONWork = inON && months >= 6
  const hasONEdu  = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' && inON
  const inPriority = profile.noc ? ON_PRIORITY_NOCS.has(profile.noc.trim().slice(0, 5)) : false

  let pts = 0
  if (hasOffer)    pts += 2
  if (hasONWork)   pts += 1
  if (hasONEdu)    pts += 1
  if (inPriority)  pts += 1

  return { score: pts, maxScore: 5, scoreLabel: 'ON connection strength' }
}

function onStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const advEdu = ['bachelors', 'two-credentials', 'masters', 'doctoral'].includes(profile.educationLevel)
  const isStudent = profile.status === 'student'
  const hasONEdu = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' && inProvince(profile, 'ON')

  const streams: PNPStream[] = []
  const onStrength = computeONStrength(profile)

  // --- Employer Job Offer - Foreign Worker ---
  const ejofMissing: string[] = []
  if (!hasOffer) ejofMissing.push('Permanent, full-time job offer from an Ontario employer (LMIA or LMIA-exempt)')
  if (!skilled) ejofMissing.push('TEER 0–3 occupation')
  if (clb < 5) ejofMissing.push('CLB 5+ language score (most TEER 0/1/2 roles require CLB 7+)')
  streams.push({
    id: 'on-employer-job-offer',
    province: 'Ontario',
    provinceCode: 'ON',
    programName: 'Ontario Immigrant Nominee Program',
    streamName: 'Employer Job Offer (Foreign Worker)',
    status: ejofMissing.length === 0 ? 'eligible' : ejofMissing.length === 1 ? 'possible' : 'not-yet',
    reason: ejofMissing.length === 0
      ? 'You meet the core requirements for the OINP Employer Job Offer stream.'
      : `Missing: ${ejofMissing[0]}${ejofMissing.length > 1 ? ` (+${ejofMissing.length - 1} more)` : ''}.`,
    missingItems: ejofMissing,
    ...onStrength,
  })

  // --- Employer Job Offer - International Student ---
  const ejoisMissing: string[] = []
  if (!isStudent && !hasONEdu) ejoisMissing.push('Graduated from an Ontario college or university (within 2 years)')
  if (!hasOffer) ejoisMissing.push('Job offer from an Ontario employer in your field of study')
  if (clb < 7) ejoisMissing.push('CLB 7+ language score')
  streams.push({
    id: 'on-intl-student',
    province: 'Ontario',
    provinceCode: 'ON',
    programName: 'Ontario Immigrant Nominee Program',
    streamName: 'Employer Job Offer (International Student)',
    status: ejoisMissing.length === 0 ? 'eligible' : ejoisMissing.length <= 1 ? 'possible' : 'not-yet',
    reason: ejoisMissing.length === 0
      ? 'You appear to meet the Ontario international student stream requirements.'
      : `Missing: ${ejoisMissing[0]}${ejoisMissing.length > 1 ? ` (+${ejoisMissing.length - 1} more)` : ''}.`,
    missingItems: ejoisMissing,
    ...onStrength,
  })

  // --- Human Capital Priorities (Express Entry) ---
  const hcpMissing: string[] = []
  if (!advEdu) hcpMissing.push("Bachelor's degree or higher")
  if (clb < 7) hcpMissing.push('CLB 7+ language score in all four skills')
  if (!skilled) hcpMissing.push('TEER 0–3 occupation with 1+ year experience')
  streams.push({
    id: 'on-human-capital',
    province: 'Ontario',
    provinceCode: 'ON',
    programName: 'Ontario Immigrant Nominee Program',
    streamName: 'Human Capital Priorities (Express Entry)',
    status: hcpMissing.length === 0 ? 'possible' : hcpMissing.length === 1 ? 'possible' : 'not-yet',
    reason: hcpMissing.length === 0
      ? 'You may receive an OINP notification of interest. Ontario draws from the EE pool periodically.'
      : `Missing: ${hcpMissing[0]}${hcpMissing.length > 1 ? ` (+${hcpMissing.length - 1} more)` : ''}.`,
    missingItems: hcpMissing,
    ...onStrength,
  })

  return streams
}

// ─── Alberta AAIP ─────────────────────────────────────────────────────────────
// AAIP does not publish a points grid — selection is merit-based within streams.
// We show a connection strength indicator (0–5) based on the factors Alberta weighs most:
// job offer (2 pts), AB work experience (1 pt), AB study (1 pt), relatives in AB (1 pt).

function computeABStrength(profile: IntakeData): { score: number; maxScore: number; scoreLabel: string } {
  const hasOffer = profile.hasJobOffer === 'yes'
  const inAB = inProvince(profile, 'AB')
  const months = canMonths(profile)
  const hasABWork = inAB && months >= 6
  const hasABStudy = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' && inAB
  const hasABRelatives =
    (profile.relativesInCanada === 'yes' || profile.canadianSibling === 'yes') &&
    (profile.pnpRelativesProvince || '').toUpperCase().startsWith('AB')

  let pts = 0
  if (hasOffer)       pts += 2
  if (hasABWork)      pts += 1
  if (hasABStudy)     pts += 1
  if (hasABRelatives) pts += 1

  return { score: pts, maxScore: 5, scoreLabel: 'AB connection strength' }
}

function abStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const months = canMonths(profile)
  const hasABWork = inProvince(profile, 'AB') && months >= 6
  const foreignYrs = foreignYears(profile)

  const streams: PNPStream[] = []
  const abStrength = computeABStrength(profile)

  // --- Alberta Opportunity Stream ---
  const aosMissing: string[] = []
  if (!hasOffer && !hasABWork) aosMissing.push('Job offer from an Alberta employer, OR 6+ months of skilled Alberta work experience')
  if (!skilled) aosMissing.push('TEER 0–3 occupation')
  if (clb < 5) aosMissing.push('CLB 5+ language score (TEER 0/1 roles: CLB 7+, TEER 2/3: CLB 5+)')
  streams.push({
    id: 'ab-opportunity',
    province: 'Alberta',
    provinceCode: 'AB',
    programName: 'Alberta Advantage Immigration Program',
    streamName: 'Alberta Opportunity Stream',
    status: aosMissing.length === 0 ? 'eligible' : aosMissing.length === 1 ? 'possible' : 'not-yet',
    reason: aosMissing.length === 0
      ? 'You appear to meet Alberta Opportunity Stream requirements.'
      : `Missing: ${aosMissing[0]}${aosMissing.length > 1 ? ` (+${aosMissing.length - 1} more)` : ''}.`,
    missingItems: aosMissing,
    ...abStrength,
  })

  // --- Alberta Express Entry Stream ---
  const aeeMissing: string[] = []
  if (!skilled) aeeMissing.push('TEER 0–3 occupation')
  if (!hasOffer && !hasABWork) aeeMissing.push('AB job offer, or demonstrated Alberta connection (work/study in AB)')
  if (clb < 7) aeeMissing.push('CLB 7+ language score')
  if (foreignYrs < 2 && months < 6) aeeMissing.push('At least 2 years of skilled work experience (foreign or Canadian)')
  streams.push({
    id: 'ab-express-entry',
    province: 'Alberta',
    provinceCode: 'AB',
    programName: 'Alberta Advantage Immigration Program',
    streamName: 'Express Entry Stream',
    status: aeeMissing.length === 0 ? 'possible' : aeeMissing.length === 1 ? 'possible' : 'not-yet',
    reason: aeeMissing.length === 0
      ? 'You may receive an Alberta nomination via the EE-linked stream (+600 CRS).'
      : `Missing: ${aeeMissing[0]}${aeeMissing.length > 1 ? ` (+${aeeMissing.length - 1} more)` : ''}.`,
    missingItems: aeeMissing,
    ...abStrength,
  })

  return streams
}

// ─── Saskatchewan SINP ────────────────────────────────────────────────────────
// SK uses a 100-point grid for the Occupations In-Demand and Employment Offer streams.
// Factor breakdown: experience (max 30) + education (max 25) + language (max 20) + age (max 15) + SK connection (max 10).
// Cut-offs vary by draw — typically 60–75 pts. Source: saskatchewan.ca/residents/moving-to-saskatchewan (verified June 2026).

function computeSKScore(profile: IntakeData): { score: number; maxScore: number } {
  const clb = minCLB(profile)
  const months = canMonths(profile)
  const totalYears = foreignYears(profile) + months / 12
  const age = parseInt(profile.age) || 0
  const inSK = inProvince(profile, 'SK')
  let pts = 0

  // Work experience (max 30)
  if (totalYears >= 3)      pts += 30
  else if (totalYears >= 2) pts += 25
  else if (totalYears >= 1) pts += 15
  else if (totalYears >= 0.5) pts += 10

  // Education (max 25)
  if (['doctoral', 'masters'].includes(profile.educationLevel))  pts += 25
  else if (profile.educationLevel === 'bachelors')                pts += 20
  else if (profile.educationLevel === 'two-credentials')          pts += 18
  else if (profile.educationLevel === '2-year')                   pts += 15
  else if (profile.educationLevel === '1-year')                   pts += 10
  else if (profile.educationLevel === 'secondary')                pts += 5

  // Language (max 20)
  if (clb >= 9)      pts += 20
  else if (clb >= 8) pts += 15
  else if (clb >= 7) pts += 10
  else if (clb >= 5) pts += 5

  // Age (max 15) — best score for prime working age
  if (age >= 21 && age <= 35)      pts += 15
  else if (age >= 36 && age <= 45) pts += 12
  else if (age >= 46 && age <= 50) pts += 8
  else if (age >= 51 && age <= 55) pts += 4

  // Saskatchewan connection (max 10)
  if (profile.hasJobOffer === 'yes' && inSK) pts += 10
  else if (profile.hasJobOffer === 'yes')    pts += 8
  else if (inSK && months >= 6)              pts += 5

  return { score: Math.min(pts, 100), maxScore: 100 }
}

// Partial list of in-demand NOC codes for SK Occupations In-Demand
const SK_IN_DEMAND_NOCS = new Set([
  '72410', '72421', '72422', '72423', '72600', '73100', '73110', '73200',
  '73201', '73300', '73400', '74100', '75110', '86101', '86102',
])

function skStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const foreignYrs = foreignYears(profile)
  const months = canMonths(profile)
  const inDemand = profile.noc ? SK_IN_DEMAND_NOCS.has(profile.noc.trim()) : false

  const streams: PNPStream[] = []
  const skScore = computeSKScore(profile)

  // --- Employment Offer ---
  const eoMissing: string[] = []
  if (!hasOffer) eoMissing.push('Valid full-time, permanent job offer from a Saskatchewan employer')
  if (!skilled) eoMissing.push('TEER 0–3 occupation')
  if (clb < 4) eoMissing.push('CLB 4+ language score')
  streams.push({
    id: 'sk-employment-offer',
    province: 'Saskatchewan',
    provinceCode: 'SK',
    programName: 'Saskatchewan Immigrant Nominee Program',
    streamName: 'Employment Offer',
    status: eoMissing.length === 0 ? 'eligible' : eoMissing.length === 1 ? 'possible' : 'not-yet',
    reason: eoMissing.length === 0
      ? 'You meet the SK Employment Offer stream requirements.'
      : `Missing: ${eoMissing[0]}${eoMissing.length > 1 ? ` (+${eoMissing.length - 1} more)` : ''}.`,
    missingItems: eoMissing,
    ...skScore,
  })

  // --- Occupations In-Demand ---
  const oidMissing: string[] = []
  if (!inDemand && !profile.noc) oidMissing.push('NOC code required — must be on the SK Occupations In-Demand list (trades and transport)')
  else if (!inDemand) oidMissing.push(`NOC ${profile.noc} does not appear on the current SK In-Demand list`)
  if (clb < 4) oidMissing.push('CLB 4+ language score')
  if (foreignYrs < 1 && months < 6) oidMissing.push('1+ year of relevant work experience')
  streams.push({
    id: 'sk-occupations-in-demand',
    province: 'Saskatchewan',
    provinceCode: 'SK',
    programName: 'Saskatchewan Immigrant Nominee Program',
    streamName: 'Occupations In-Demand',
    status: oidMissing.length === 0 ? 'possible' : oidMissing.length === 1 ? 'possible' : 'not-yet',
    reason: oidMissing.length === 0
      ? `Your NOC (${profile.noc}) is on the SK In-Demand list — no job offer required.`
      : `Missing: ${oidMissing[0]}${oidMissing.length > 1 ? ` (+${oidMissing.length - 1} more)` : ''}.`,
    missingItems: oidMissing,
    ...skScore,
  })

  return streams
}

// ─── Manitoba MPNP ───────────────────────────────────────────────────────────
// MPNP uses an internal EOI scoring system not fully disclosed publicly.
// Connection strength reflects the four factors MB weighs most in selections:
// job offer (dominant), MB work experience, MB family ties, French language.

function computeMBStrength(profile: IntakeData): { score: number; maxScore: number; scoreLabel: string } {
  const hasOffer  = profile.hasJobOffer === 'yes'
  const inMB      = inProvince(profile, 'MB')
  const months    = canMonths(profile)
  const hasMBWork = inMB && months >= 6
  // MB family: dedicated field for MPNP family stream, or relatives in MB
  const hasMBFamily =
    (profile.manitobaFamilyRelative && profile.manitobaFamilyRelative !== 'none' && profile.manitobaFamilyRelative !== '') ||
    ((profile.relativesInCanada === 'yes' || profile.canadianSibling === 'yes') &&
      (profile.pnpRelativesProvince || '').toUpperCase().startsWith('MB'))
  // French: any French test scores indicate proficiency
  const hasFrench = profile.frenchTestType !== '' && profile.frenchTestType !== 'none'

  let pts = 0
  if (hasOffer)    pts += 2
  if (hasMBWork)   pts += 1
  if (hasMBFamily) pts += 1
  if (hasFrench)   pts += 1

  return { score: pts, maxScore: 5, scoreLabel: 'MB connection strength' }
}

function mbStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const months = canMonths(profile)
  const hasMBWork = inProvince(profile, 'MB') && months >= 6
  const foreignYrs = foreignYears(profile)

  const streams: PNPStream[] = []
  const mbStrength = computeMBStrength(profile)

  // --- Skilled Workers in Manitoba ---
  const swimMissing: string[] = []
  if (!hasMBWork) swimMissing.push('Currently employed full-time in Manitoba (6+ months)')
  if (!skilled) swimMissing.push('TEER 0–3 occupation')
  if (clb < 4) swimMissing.push('CLB 4+ language score')
  streams.push({
    id: 'mb-skilled-workers-mb',
    province: 'Manitoba',
    provinceCode: 'MB',
    programName: 'Manitoba Provincial Nominee Program',
    streamName: 'Skilled Workers in Manitoba',
    status: swimMissing.length === 0 ? 'eligible' : swimMissing.length === 1 ? 'possible' : 'not-yet',
    reason: swimMissing.length === 0
      ? 'You appear to meet the Skilled Workers in Manitoba stream requirements.'
      : `Missing: ${swimMissing[0]}${swimMissing.length > 1 ? ` (+${swimMissing.length - 1} more)` : ''}.`,
    missingItems: swimMissing,
    ...mbStrength,
  })

  // --- Skilled Workers Overseas ---
  const swoMissing: string[] = []
  if (!hasOffer) swoMissing.push('Job offer from a Manitoba employer, OR close family in Manitoba, OR previous Manitoba work/study')
  if (!skilled) swoMissing.push('TEER 0–3 occupation')
  if (clb < 5) swoMissing.push('CLB 5+ language score')
  if (foreignYrs < 1) swoMissing.push('At least 1 year of skilled work experience')
  streams.push({
    id: 'mb-skilled-workers-overseas',
    province: 'Manitoba',
    provinceCode: 'MB',
    programName: 'Manitoba Provincial Nominee Program',
    streamName: 'Skilled Workers Overseas',
    status: swoMissing.length === 0 ? 'possible' : swoMissing.length === 1 ? 'possible' : 'not-yet',
    reason: swoMissing.length === 0
      ? 'You may qualify for the MB Skilled Workers Overseas stream.'
      : `Missing: ${swoMissing[0]}${swoMissing.length > 1 ? ` (+${swoMissing.length - 1} more)` : ''}.`,
    missingItems: swoMissing,
    ...mbStrength,
  })

  return streams
}

// ─── Atlantic Immigration Program (AIP) ──────────────────────────────────────
// AIP is employer-gated: a designated employer offer is the primary gate.
// We show a 3-item readiness checklist (not stars) — each item is binary: met or blocked.
// The job offer item carries a warning: hasJobOffer=yes covers any offer, but AIP specifically
// requires an offer from a government-designated organization. The UI makes this explicit.

const ATLANTIC_CODES = ['NS', 'NB', 'PE', 'NL']
const ATLANTIC_NAMES: Record<string, string> = {
  NS: 'Nova Scotia', NB: 'New Brunswick', PE: 'Prince Edward Island', NL: 'Newfoundland & Labrador'
}

function buildAtlanticReadiness(profile: IntakeData, clb: number): ReadinessItem[] {
  const hasOffer = profile.hasJobOffer === 'yes'
  const hasEducation = profile.educationLevel !== '' &&
    profile.educationLevel !== 'none' &&
    profile.educationLevel !== 'less-than-secondary'

  return [
    {
      label: 'Designated employer offer',
      met: hasOffer,
      warning: hasOffer
        ? 'Your offer must be from an AIP-designated organization — verify at canada.ca/aip-employers before applying.'
        : undefined,
    },
    {
      label: 'Language — CLB 4+',
      met: clb >= 4,
    },
    {
      label: 'Education credential',
      met: hasEducation,
    },
  ]
}

function atlanticStreams(profile: IntakeData): PNPStream[] {
  const code = (profile.intendedProvince || '').toUpperCase().slice(0, 2)
  const prov = ATLANTIC_NAMES[code] || 'Atlantic Canada'

  const clb = minCLB(profile)
  const teer = profile.teerLevel
  const hasOffer = profile.hasJobOffer === 'yes'
  const isStudent = profile.status === 'student'
  const hasAtlanticEdu = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' &&
    ATLANTIC_CODES.includes((profile.province || '').toUpperCase().slice(0, 2))

  const readinessItems = buildAtlanticReadiness(profile, clb)
  const streams: PNPStream[] = []

  // --- AIP Skilled Worker ---
  const swMissing: string[] = []
  if (!hasOffer) swMissing.push(`Job offer from a designated employer in ${prov}`)
  const teerOk = ['0','1','2','3'].includes(teer)
  const teer45 = ['4','5'].includes(teer)
  const clbMin = teer45 ? 5 : 4
  if (!teerOk && !teer45) swMissing.push('TEER 0–5 occupation (TEER 0–3 requires CLB 4+; TEER 4–5 requires CLB 5+)')
  if (clb < clbMin && teer) swMissing.push(`CLB ${clbMin}+ language score (required for TEER ${teer})`)
  streams.push({
    id: `${code.toLowerCase()}-aip-skilled-worker`,
    province: prov,
    provinceCode: code,
    programName: 'Atlantic Immigration Program',
    streamName: 'Skilled Worker',
    status: swMissing.length === 0 ? 'eligible' : swMissing.length === 1 ? 'possible' : 'not-yet',
    reason: swMissing.length === 0
      ? `You appear to meet the AIP Skilled Worker requirements for ${prov}.`
      : `Missing: ${swMissing[0]}${swMissing.length > 1 ? ` (+${swMissing.length - 1} more)` : ''}.`,
    missingItems: swMissing,
    readinessItems,
  })

  // --- AIP International Graduate ---
  const igMissing: string[] = []
  if (!isStudent && !hasAtlanticEdu) igMissing.push(`Graduation from a recognized institution in ${prov}`)
  if (!hasOffer) igMissing.push(`Job offer from a designated employer in ${prov}`)
  if (clb < 4) igMissing.push('CLB 4+ language score')
  streams.push({
    id: `${code.toLowerCase()}-aip-intl-graduate`,
    province: prov,
    provinceCode: code,
    programName: 'Atlantic Immigration Program',
    streamName: 'International Graduate',
    status: igMissing.length === 0 ? 'eligible' : igMissing.length === 1 ? 'possible' : 'not-yet',
    reason: igMissing.length === 0
      ? `You appear to meet the AIP International Graduate requirements for ${prov}.`
      : `Missing: ${igMissing[0]}${igMissing.length > 1 ? ` (+${igMissing.length - 1} more)` : ''}.`,
    missingItems: igMissing,
    readinessItems,
  })

  return streams
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Returns PNP stream matches for the user's intended province.
 * Returns an empty array if no province is set or if the province is QC (separate system).
 */
export function matchPNPStreams(profile: IntakeData): PNPStream[] {
  const prov = (profile.intendedProvince || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)

  if (!prov || prov === 'QC') return []

  if (prov === 'BC') return bcStreams(profile)
  if (prov === 'ON') return onStreams(profile)
  if (prov === 'AB') return abStreams(profile)
  if (prov === 'SK') return skStreams(profile)
  if (prov === 'MB') return mbStreams(profile)
  if (ATLANTIC_CODES.includes(prov)) return atlanticStreams(profile)

  return []
}

export const pnpStatusLabels: Record<PNPStreamStatus, string> = {
  eligible: 'Likely eligible',
  possible: 'Possible',
  'not-yet': 'Not yet',
  'not-applicable': 'Not applicable',
}

export const pnpStatusColors: Record<PNPStreamStatus, string> = {
  eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  possible: 'bg-blue-50 text-blue-700 border-blue-200',
  'not-yet': 'bg-slate-50 text-slate-500 border-slate-200',
  'not-applicable': 'bg-slate-50 text-slate-400 border-slate-100',
}
