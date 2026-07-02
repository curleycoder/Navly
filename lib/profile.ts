export type IntakeData = {
  // Identity
  fullName: string
  email: string
  phone: string
  gender: string        // 'male' | 'female' | 'non-binary' | 'prefer-not' | ''

  // First question — "What do you need help with today?"
  primaryUse: string  // 'deadlines' | 'pr' | 'citizenship' | 'residency' | 'explore'

  // Phase 1 — always collected
  locationStatus: string  // 'inside' | 'outside' — primary split
  plannedEntry: string    // for outside users: 'study-permit' | 'work-permit' | 'visitor' | 'express-entry' | 'family' | 'business' | 'unsure'
  status: string          // for inside users: 'student' | 'work-permit' | 'visitor' | 'refugee' | 'family-member' | 'out-of-status' | 'pr' | 'other'
  originCountry: string
  currentCountry: string
  province: string
  city: string
  goal: string          // 'pr' | 'work-permit' | 'study-permit' | 'citizenship' | 'family' | 'business' | 'compare' | 'other'
  timeline: string      // 'urgent' | 'soon' | 'planning' | 'unsure'
  arrivalDate: string   // 'YYYY-MM-DD' — when user arrived in Canada (empty if outside Canada)
  visaExpiryDate: string // 'YYYY-MM-DD' — visa/permit expiry for reminders
  targetArrivalTimeline: string // for outside users: 'within-3-months' | '3-6-months' | '6-12-months' | '1-2-years' | 'not-sure'

  // Phase 2 — PR profile
  age: string        // kept for backwards compat; prefer birthYear+birthMonth when set
  birthYear: string  // 'YYYY' — used to compute age dynamically (auto-updates on birthday)
  birthMonth: string // '1'–'12'
  maritalStatus: string
  spouseComing: string  // 'yes' | 'no' | ''

  // Spouse/partner details (when spouseComing = 'yes')
  spouseLangTestType: string
  spouseLangReading: string
  spouseLangWriting: string
  spouseLangListening: string
  spouseLangSpeaking: string
  spouseEducationLevel: string
  spouseCanadianWorkMonths: string

  // Language
  firstOfficialLanguage: string  // 'english' | 'french' | ''

  // First official language test
  langTestType: string   // 'ielts-general' | 'celpip' | 'pte' | 'tef' | 'tcf' | 'none' | 'other'
  langTestName: string   // custom name when langTestType = 'other'
  langTestDate: string   // 'YYYY-MM-DD' — exact test date for 2-year validity tracking
  langReading: string
  langWriting: string
  langListening: string
  langSpeaking: string

  // Second official language test (optional — adds up to 24 bonus CRS points)
  lang2TestType: string  // 'ielts-general' | 'celpip' | 'pte' | 'tef' | 'tcf' | 'none'
  lang2TestDate: string  // 'YYYY-MM-DD'
  lang2Reading: string
  lang2Writing: string
  lang2Listening: string
  lang2Speaking: string

  // Education
  educationLevel: string
  canadianEducation: string
  ecaCompleted: string

  // Work
  noc: string
  teerLevel: string
  foreignWorkYears: string
  canadianWorkMonths: string
  hasJobOffer: string
  hasDesignatedEmployerOffer: string // 'yes' | 'no' | 'unsure' | '' — AIP-specific: is the offer from a gov-designated organization?

  // Settlement funds
  familySize: string       // numeric string
  settlementFunds: string  // numeric string (CAD)

  // Family ties in Canada
  canadianSibling: string          // 'yes' | 'no' | ''
  manitobaFamilyRelative: string   // 'parent' | 'child' | 'grandparent' | 'sibling' | 'none' | '' — Manitoba PNP Family Stream

  // Second official language (French)
  frenchTestType: string   // 'tef' | 'tcf' | 'none'
  frenchReading: string
  frenchWriting: string
  frenchListening: string
  frenchSpeaking: string

  // Provincial nomination
  pnpNomination: string    // 'yes' | 'no' | ''

  // PNP ties (province-specific eligibility factors)
  pnpJobOfferProvince: string       // province of job offer (may differ from intended)
  pnpEducationProvince: string      // province where studied in Canada
  pnpRelativesProvince: string      // province where relatives live
  employerSupportsPNP: string       // 'yes' | 'no' | 'unsure' | ''
  workExpInTargetProvince: string   // 'yes' | 'no' | ''
  studiedInTargetProvince: string   // 'yes' | 'no' | ''
  ruralCommunityInterest: string    // 'yes' | 'no' | ''

  // Risk flags
  previousRefusals: string      // 'yes' | 'no' | ''
  lostStatus: string            // 'yes' | 'no' | '' (overstay or out-of-status)
  criminalityIssues: string     // 'yes' | 'no' | ''
  removalOrder: string          // 'yes' | 'no' | ''
  medicalInadmissibility: string // 'yes' | 'no' | ''

  // Student-specific
  programLevel: string
  programLengthMonths: string
  graduationDate: string
  schoolName: string
  dliNumber: string
  programStartDate: string      // 'YYYY-MM'
  programEndDate: string        // 'YYYY-MM'
  fieldOfStudy: string
  fullTimeStudy: string         // 'yes' | 'no' | ''
  hadPartTimeSemester: string   // 'yes' | 'no' | ''
  unauthorizedWork: string      // 'yes' | 'no' | ''
  pgwpApplied: string           // 'yes' | 'no' | 'not-applicable' | ''
  pgwpExpiry: string            // 'YYYY-MM'
  workAuthAfterGrad: string     // 'pgwp' | 'bridging' | 'none' | ''

  // Worker-specific
  workPermitType: string
  permitExpiry: string          // 'YYYY-MM'
  passportExpiry: string        // 'YYYY-MM' — used for passport renewal reminders
  wage: string                  // hourly CAD
  hoursPerWeek: string
  workStartDate: string         // 'YYYY-MM-DD'
  employerName: string
  jobTitle: string
  fullTimeOrPartTime: string    // 'full-time' | 'part-time' | ''
  sameEmployerAsJobOffer: string // 'yes' | 'no' | ''
  lmiaNumber: string
  provinceOfJob: string
  isPermanentNonSeasonal: string // 'yes' | 'no' | ''
  isSelfEmployed: string         // 'yes' | 'no' | ''

  // FSW / outside Canada
  continuousSkilledWork1yr: string  // 'yes' | 'no' | ''
  fswWorkDateFrom: string           // 'YYYY-MM'
  fswWorkDateTo: string             // 'YYYY-MM'
  paidWork: string                  // 'yes' | 'no' | ''
  fullTimeEquivalent: string        // 'full-time' | 'part-time-equivalent' | ''
  educationCredentialCountry: string
  ecaOrganization: string
  ecaIssueDate: string              // 'YYYY-MM'
  ecaExpiryDate: string             // 'YYYY-MM'
  relativesInCanada: string         // 'yes' | 'no' | ''
  jobSearchStatus: string           // 'actively-searching' | 'have-offer' | 'not-yet' | ''

  // Visitor-specific
  visitorRecordExpiry: string       // 'YYYY-MM-DD'
  applyingForStudyPermit: string    // 'yes' | 'no' | 'considering' | ''
  eligibleForEEFromAbroad: string   // 'yes' | 'no' | 'unsure' | ''
  extendedVisitorStatus: string     // 'yes' | 'no' | 'planning' | ''

  // Province targeting
  intendedProvince: string

  // Quebec intent (separate from province/intendedProvince)
  quebecIntent: string     // 'yes' | 'no' | ''

  // Family ties
  parentOrChildSponsor: string // 'yes' | 'no' | ''

  // Student-specific budget
  studyBudget: string      // CAD per year

  // Formal citizenship (legal nationality — originCountry used as fallback)
  citizenship: string

  // PR / Citizenship tracking
  prDate: string              // 'YYYY-MM-DD' — date became PR
  prCardExpiry: string        // 'YYYY-MM' — PR card expiry
  prPreStatus: string         // status before PR: 'student' | 'worker' | 'visitor' | 'protected' | 'other'
  hasTraveledSincePR: string  // 'yes' | 'no' | ''
  taxFilingComplete: string   // 'yes' | 'no' | 'partial' | ''
  citizenshipLangProof: string // 'yes' | 'no' | '' — language proof for citizenship (age 18–54)
  citizenshipProhibitions: string // 'yes' | 'no' | '' — criminal, removal order, probation

  // PR residency obligation tracking (730 days in Canada per 5-year period)
  daysOutsideCanada5yr: string          // numeric string — days outside Canada in last 5 years
  accompanyingCitizenSpouseAbroad: string // 'yes' | 'no' | '' — time abroad counts if accompanying citizen spouse
  workingAbroadForCanadianEmployer: string // 'yes' | 'no' | '' — time abroad counts if employed by Canadian gov/business

  // Work authorization checks (CEC / FSW accuracy)
  canadianWorkAuthorized: string           // 'yes' | 'no' | '' — was Canadian work legally authorized?
  canadianWorkWhileFullTimeStudent: string // 'yes' | 'no' | '' — work counted during full-time study?
  currentlyAuthorizedToWorkCanada: string  // 'yes' | 'no' | '' — for FSW funds exemption check
  hasValidJobOfferForFundsExemption: string // 'yes' | 'no' | '' — job offer that exempts from FSW funds

  // PGWP 2026 eligibility checks
  programPgwpEligible: string     // 'yes' | 'no' | '' — is program on PGWP-eligible list?
  pgwpLanguageMet: string         // 'yes' | 'no' | '' — language proof requirement met?
  fieldOfStudyRequired: string    // 'yes' | 'no' | '' — does program need CIP code check?
  cipCodeEligible: string         // 'yes' | 'no' | '' — CIP code on eligible field-of-study list?
  schoolIsDLI: string             // 'yes' | 'no' | '' — school is a designated learning institution?
  graduatedFromFlightSchool: string // 'yes' | 'no' | '' — flight school (exempt from field-of-study)

  // Visitor / maintained status
  canApplyInsideCanadaException: string // 'yes' | 'no' | '' — falls under inside-Canada WP/SP exception?
  appliedBeforeStatusExpiry: string     // 'yes' | 'no' | '' — applied before current status expired?

  // User preferences
  reminderOptIn: string    // 'yes' | '' — explicit consent to receive deadline email reminders

  // Account state (set by auth flow, not user-editable)
  phoneVerified: string    // 'yes' | 'no' | ''
  duplicateStatus: string  // 'clean' | 'duplicate' | ''

  // Sync metadata — not user-editable
  _updatedAt: string  // ISO timestamp set on every local save; used for conflict resolution
}

export const EMPTY_PROFILE: IntakeData = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  primaryUse: '',
  locationStatus: '',
  plannedEntry: '',
  status: '',
  originCountry: '',
  currentCountry: '',
  province: '',
  city: '',
  goal: '',
  timeline: '',
  arrivalDate: '',
  visaExpiryDate: '',
  targetArrivalTimeline: '',
  age: '',
  birthYear: '',
  birthMonth: '',
  maritalStatus: '',
  spouseComing: '',
  spouseLangTestType: '',
  spouseLangReading: '',
  spouseLangWriting: '',
  spouseLangListening: '',
  spouseLangSpeaking: '',
  spouseEducationLevel: '',
  spouseCanadianWorkMonths: '',
  firstOfficialLanguage: '',
  langTestType: '',
  langTestName: '',
  langTestDate: '',
  langReading: '',
  langWriting: '',
  langListening: '',
  langSpeaking: '',
  lang2TestType: '',
  lang2TestDate: '',
  lang2Reading: '',
  lang2Writing: '',
  lang2Listening: '',
  lang2Speaking: '',
  educationLevel: '',
  canadianEducation: '',
  ecaCompleted: '',
  noc: '',
  teerLevel: '',
  foreignWorkYears: '',
  canadianWorkMonths: '',
  hasJobOffer: '',
  hasDesignatedEmployerOffer: '',
  familySize: '',
  settlementFunds: '',
  canadianSibling: '',
  manitobaFamilyRelative: '',
  frenchTestType: '',
  frenchReading: '',
  frenchWriting: '',
  frenchListening: '',
  frenchSpeaking: '',
  pnpNomination: '',
  pnpJobOfferProvince: '',
  pnpEducationProvince: '',
  pnpRelativesProvince: '',
  employerSupportsPNP: '',
  workExpInTargetProvince: '',
  studiedInTargetProvince: '',
  ruralCommunityInterest: '',
  previousRefusals: '',
  lostStatus: '',
  criminalityIssues: '',
  removalOrder: '',
  medicalInadmissibility: '',
  programLevel: '',
  programLengthMonths: '',
  graduationDate: '',
  schoolName: '',
  dliNumber: '',
  programStartDate: '',
  programEndDate: '',
  fieldOfStudy: '',
  fullTimeStudy: '',
  hadPartTimeSemester: '',
  unauthorizedWork: '',
  pgwpApplied: '',
  pgwpExpiry: '',
  workAuthAfterGrad: '',
  workPermitType: '',
  permitExpiry: '',
  passportExpiry: '',
  wage: '',
  hoursPerWeek: '',
  workStartDate: '',
  employerName: '',
  jobTitle: '',
  fullTimeOrPartTime: '',
  sameEmployerAsJobOffer: '',
  lmiaNumber: '',
  provinceOfJob: '',
  isPermanentNonSeasonal: '',
  isSelfEmployed: '',
  continuousSkilledWork1yr: '',
  fswWorkDateFrom: '',
  fswWorkDateTo: '',
  paidWork: '',
  fullTimeEquivalent: '',
  educationCredentialCountry: '',
  ecaOrganization: '',
  ecaIssueDate: '',
  ecaExpiryDate: '',
  relativesInCanada: '',
  jobSearchStatus: '',
  visitorRecordExpiry: '',
  applyingForStudyPermit: '',
  eligibleForEEFromAbroad: '',
  extendedVisitorStatus: '',
  intendedProvince: '',
  quebecIntent: '',
  parentOrChildSponsor: '',
  studyBudget: '',
  citizenship: '',
  prDate: '',
  prCardExpiry: '',
  prPreStatus: '',
  hasTraveledSincePR: '',
  taxFilingComplete: '',
  citizenshipLangProof: '',
  citizenshipProhibitions: '',
  daysOutsideCanada5yr: '',
  accompanyingCitizenSpouseAbroad: '',
  workingAbroadForCanadianEmployer: '',
  canadianWorkAuthorized: '',
  canadianWorkWhileFullTimeStudent: '',
  currentlyAuthorizedToWorkCanada: '',
  hasValidJobOfferForFundsExemption: '',
  programPgwpEligible: '',
  pgwpLanguageMet: '',
  fieldOfStudyRequired: '',
  cipCodeEligible: '',
  schoolIsDLI: '',
  graduatedFromFlightSchool: '',
  canApplyInsideCanadaException: '',
  appliedBeforeStatusExpiry: '',
  reminderOptIn: '',
  phoneVerified: '',
  duplicateStatus: '',
  _updatedAt: '',
}

const KEY = 'navly_profile'

export function saveProfile(data: IntakeData): IntakeData {
  if (typeof window === 'undefined') return data
  const stamped: IntakeData = { ...data, _updatedAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify(stamped))
  return stamped
}

// Write to localStorage without updating _updatedAt — used when restoring from cloud
// so the cloud timestamp is preserved for future comparisons.
function writeProfileToCache(data: IntakeData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function loadProfile(): IntakeData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<IntakeData>) }
  } catch {
    return null
  }
}

export const statusLabels: Record<string, string> = {
  'outside-canada': 'Outside Canada',
  student: 'International student',
  'work-permit': 'Worker (work permit)',
  visitor: 'Visitor',
  refugee: 'Refugee / protected person',
  'family-member': 'Spouse / family of Canadian or PR',
  'out-of-status': 'Out of status',
  pr: 'Permanent resident',
  other: 'Other / not sure',
}

export const goalLabels: Record<string, string> = {
  pr: 'Permanent residence',
  'work-permit': 'Work permit',
  'study-permit': 'Study permit',
  citizenship: 'Citizenship',
  family: 'Join family in Canada',
  business: 'Start or expand a business',
  compare: 'Compare options',
  other: 'Not sure yet',
}

export const timelineLabels: Record<string, string> = {
  urgent: 'Within 3 months',
  soon: '3–6 months',
  planning: '6+ months',
  unsure: 'Not sure yet',
}

export const educationLabels: Record<string, string> = {
  'less-than-secondary': 'Less than high school',
  secondary: 'High school diploma',
  '1-year': '1-year post-secondary',
  '2-year': '2-year post-secondary',
  bachelors: "Bachelor's degree (3+ years)",
  'two-credentials': 'Two post-secondary credentials (one 3+ years)',
  masters: "Master's degree",
  doctoral: 'Doctoral degree (PhD)',
}

// Settlement funds required per family size (IRCC 2024)
export const SETTLEMENT_FUNDS: Record<number, number> = {
  1: 13757,
  2: 17127,
  3: 21055,
  4: 25564,
  5: 28994,
  6: 32700,
  7: 36407,
}

export function getRequiredFunds(familySize: number): number {
  if (familySize <= 0) return SETTLEMENT_FUNDS[1]
  if (familySize >= 7) return SETTLEMENT_FUNDS[7]
  return SETTLEMENT_FUNDS[familySize] ?? SETTLEMENT_FUNDS[7]
}

const PERMIT_RENEWAL: Record<string, { label: string; fee: string; renewalUrl: string }> = {
  student: {
    label: 'Study permit',
    fee: '$150 CAD',
    renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/extend-study-permit.html',
  },
  'work-permit': {
    label: 'Work permit',
    fee: '$155 CAD',
    renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html',
  },
  visitor: {
    label: 'Visitor status',
    fee: '$100 CAD',
    renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/extend-stay.html',
  },
  'family-member': {
    label: 'Work/study permit',
    fee: '$155 CAD',
    renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html',
  },
  pr: {
    label: 'PR card',
    fee: '$50 CAD',
    renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html',
  },
}

// Days until visa/permit expiry (null if no expiry set or >90 days away)
export function getPermitWarning(profile: IntakeData): {
  daysLeft: number
  urgent: boolean
  expiryDate: string
  permitLabel: string
  renewalFee: string
  renewalUrl: string
} | null {
  let expiry: Date | null = null
  if (profile.visaExpiryDate) {
    expiry = new Date(profile.visaExpiryDate)
  } else if (profile.permitExpiry) {
    expiry = new Date(profile.permitExpiry + '-01')
  }
  if (!expiry) return null
  const today = new Date()
  const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft > 90) return null
  const info = PERMIT_RENEWAL[profile.status] ?? {
    label: 'Permit',
    fee: 'See IRCC website',
    renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html',
  }
  const expiryDate = expiry.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  return { daysLeft, urgent: daysLeft <= 30, expiryDate, permitLabel: info.label, renewalFee: info.fee, renewalUrl: info.renewalUrl }
}

export const plannedEntryLabels: Record<string, string> = {
  'study-permit': 'Study permit',
  'work-permit': 'Work permit',
  visitor: 'Visitor visa',
  'express-entry': 'Express Entry (direct PR)',
  family: 'Family sponsorship',
  business: 'Business / investment',
  unsure: 'Not sure yet',
}

// ─── Supabase sync ────────────────────────────────────────────────────────────

export async function saveProfileToSupabase(userId: string, data: IntakeData): Promise<void> {
  const { supabase } = await import('./supabase/client')
  const ts = data._updatedAt || new Date().toISOString()
  await supabase.from('profiles').upsert({
    id: userId,
    profile_data: { ...data, _updatedAt: ts },
    updated_at: ts,
  })
}

export async function loadProfileFromSupabase(userId: string): Promise<IntakeData | null> {
  const { supabase } = await import('./supabase/client')
  const { data } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .single()
  if (data?.profile_data) {
    const profile: IntakeData = {
      ...EMPTY_PROFILE,
      ...(data.profile_data as Partial<IntakeData>),
      // profile_data._updatedAt is the single source of truth for conflict resolution.
      // DB updated_at is audit metadata only and is intentionally ignored here.
      _updatedAt: (data.profile_data as Partial<IntakeData>)._updatedAt || '',
    }
    writeProfileToCache(profile)
    return profile
  }
  return null
}

// Sync profile between localStorage and Supabase.
// profile_data._updatedAt is the sole conflict-resolution authority.
// DB updated_at is never used for comparison — a server-side DB touch
// must not silently beat a newer client record.
export async function syncProfile(userId: string): Promise<IntakeData | null> {
  const local = loadProfile()

  try {
    const { supabase } = await import('./supabase/client')
    const { data } = await supabase
      .from('profiles')
      .select('profile_data')
      .eq('id', userId)
      .single()

    if (!data?.profile_data) {
      // Nothing in cloud — upload local data if it exists
      if (local) saveProfileToSupabase(userId, local).catch(() => {})
      return local
    }

    const remote: IntakeData = {
      ...EMPTY_PROFILE,
      ...(data.profile_data as Partial<IntakeData>),
      _updatedAt: (data.profile_data as Partial<IntakeData>)._updatedAt || '',
    }

    if (!local) {
      writeProfileToCache(remote)
      return remote
    }

    const localTime = local._updatedAt ? new Date(local._updatedAt).getTime() : 0
    const remoteTime = remote._updatedAt ? new Date(remote._updatedAt).getTime() : 0

    if (remoteTime > localTime) {
      // Cloud is newer — restore to local cache
      writeProfileToCache(remote)
      return remote
    } else {
      // Local is newer — push to cloud
      saveProfileToSupabase(userId, local).catch(() => {})
      return local
    }
  } catch {
    // Offline or network error — fall back to local
    return local
  }
}
