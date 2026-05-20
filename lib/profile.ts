export type IntakeData = {
  // Identity
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string        // 'male' | 'female' | 'non-binary' | 'prefer-not' | ''

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

  // Phase 2 — PR profile
  age: string
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

  // Language (first official)
  langTestType: string   // 'ielts-general' | 'ielts-academic' | 'celpip' | 'pte' | 'tef' | 'tcf' | 'none' | 'other'
  langTestName: string   // custom name when langTestType = 'other'
  langTestDate: string   // 'YYYY-MM' — test date, used to check 2-year validity
  langReading: string
  langWriting: string
  langListening: string
  langSpeaking: string

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

  // Risk flags
  previousRefusals: string // 'yes' | 'no' | ''
  lostStatus: string       // 'yes' | 'no' | '' (overstay or out-of-status)

  // Student-specific
  programLevel: string
  programLengthMonths: string
  graduationDate: string

  // Worker-specific
  workPermitType: string
  permitExpiry: string     // 'YYYY-MM'
  wage: string             // hourly CAD
  hoursPerWeek: string
  workStartDate: string    // 'YYYY-MM-DD'

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

  // Account state (set by auth flow, not user-editable)
  phoneVerified: string    // 'yes' | 'no' | ''
  duplicateStatus: string  // 'clean' | 'duplicate' | ''
}

export const EMPTY_PROFILE: IntakeData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
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
  age: '',
  maritalStatus: '',
  spouseComing: '',
  spouseLangTestType: '',
  spouseLangReading: '',
  spouseLangWriting: '',
  spouseLangListening: '',
  spouseLangSpeaking: '',
  spouseEducationLevel: '',
  spouseCanadianWorkMonths: '',
  langTestType: '',
  langTestName: '',
  langTestDate: '',
  langReading: '',
  langWriting: '',
  langListening: '',
  langSpeaking: '',
  educationLevel: '',
  canadianEducation: '',
  ecaCompleted: '',
  noc: '',
  teerLevel: '',
  foreignWorkYears: '',
  canadianWorkMonths: '',
  hasJobOffer: '',
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
  previousRefusals: '',
  lostStatus: '',
  programLevel: '',
  programLengthMonths: '',
  graduationDate: '',
  workPermitType: '',
  permitExpiry: '',
  wage: '',
  hoursPerWeek: '',
  workStartDate: '',
  intendedProvince: '',
  quebecIntent: '',
  parentOrChildSponsor: '',
  studyBudget: '',
  citizenship: '',
  phoneVerified: '',
  duplicateStatus: '',
}

const KEY = 'navly_profile'

export function saveProfile(data: IntakeData) {
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

// Days until visa/permit expiry (null if no expiry set or >90 days away)
export function getPermitWarning(profile: IntakeData): { daysLeft: number; urgent: boolean } | null {
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
  return { daysLeft, urgent: daysLeft <= 30 }
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
  await supabase.from('profiles').upsert({
    id: userId,
    profile_data: data,
    updated_at: new Date().toISOString(),
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
    const profile = { ...EMPTY_PROFILE, ...(data.profile_data as Partial<IntakeData>) }
    saveProfile(profile)
    return profile
  }
  return null
}
