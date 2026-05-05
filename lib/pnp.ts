/**
 * PNP Stream Matching Engine
 * Matches a user's profile against the main streams for each province.
 * All thresholds reflect 2025/2026 IRCC/PNP program guidelines.
 * This is for planning purposes only — always verify at the official provincial website.
 */
import type { IntakeData } from './profile'
import { convertToCLB } from './scoring'

export type PNPStreamStatus = 'eligible' | 'possible' | 'not-yet' | 'not-applicable'

export type PNPStream = {
  id: string
  province: string         // full name, e.g. 'British Columbia'
  provinceCode: string     // 2-letter code
  programName: string      // e.g. 'BC Skills Immigration'
  streamName: string
  status: PNPStreamStatus
  reason: string           // one-line summary
  missingItems: string[]   // actionable missing requirements
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

function matchesProvince(profile: IntakeData, code: string): boolean {
  const p = (profile.intendedProvince || '').toUpperCase()
  return p === code || p.startsWith(code)
}

function inProvince(profile: IntakeData, code: string): boolean {
  const p = (profile.province || '').toUpperCase()
  return p === code || p.startsWith(code)
}

// ─── BC Skills Immigration (BCPNP) ───────────────────────────────────────────

function bcStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const months = canMonths(profile)
  const hasBCWork = inProvince(profile, 'BC') && months >= 9
  const hasBCEdu = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' && inProvince(profile, 'BC')
  const isStudent = profile.status === 'student'

  const streams: PNPStream[] = []

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
  })

  return streams
}

// ─── Ontario OINP ─────────────────────────────────────────────────────────────

function onStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const advEdu = ['bachelors', 'two-credentials', 'masters', 'doctoral'].includes(profile.educationLevel)
  const isStudent = profile.status === 'student'
  const hasONEdu = profile.canadianEducation !== 'none' && profile.canadianEducation !== '' && inProvince(profile, 'ON')

  const streams: PNPStream[] = []

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
  })

  return streams
}

// ─── Alberta AAIP ─────────────────────────────────────────────────────────────

function abStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const months = canMonths(profile)
  const hasABWork = inProvince(profile, 'AB') && months >= 6
  const foreignYrs = foreignYears(profile)

  const streams: PNPStream[] = []

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
  })

  return streams
}

// ─── Saskatchewan SINP ────────────────────────────────────────────────────────

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
  })

  return streams
}

// ─── Manitoba MPNP ───────────────────────────────────────────────────────────

function mbStreams(profile: IntakeData): PNPStream[] {
  const clb = minCLB(profile)
  const skilled = isSkilled(profile.teerLevel)
  const hasOffer = profile.hasJobOffer === 'yes'
  const months = canMonths(profile)
  const hasMBWork = inProvince(profile, 'MB') && months >= 6
  const foreignYrs = foreignYears(profile)

  const streams: PNPStream[] = []

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
  })

  return streams
}

// ─── Atlantic Immigration Program (AIP) ──────────────────────────────────────

const ATLANTIC_CODES = ['NS', 'NB', 'PE', 'NL']
const ATLANTIC_NAMES: Record<string, string> = {
  NS: 'Nova Scotia', NB: 'New Brunswick', PE: 'Prince Edward Island', NL: 'Newfoundland & Labrador'
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
