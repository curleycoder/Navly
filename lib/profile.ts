export type IntakeData = {
  // Phase 1 — always collected
  status: string        // 'outside-canada' | 'student' | 'work-permit' | 'visitor' | 'pr' | 'other'
  originCountry: string
  currentCountry: string
  province: string      // Canadian province/territory code (e.g. 'ON') — empty if not in Canada
  city: string
  goal: string          // 'pr' | 'work-permit' | 'study-permit' | 'citizenship' | 'other'
  timeline: string      // 'urgent' | 'soon' | 'planning' | 'unsure'

  // Phase 2 — PR profile (collected when goal = 'pr')
  age: string                 // numeric string
  maritalStatus: string       // 'single' | 'married' | 'common-law'
  spouseComing: string        // 'yes' | 'no' | ''

  // Language
  langTestType: string        // 'ielts-general' | 'celpip' | 'pte' | 'none'
  langReading: string         // numeric string
  langWriting: string
  langListening: string
  langSpeaking: string

  // Education
  educationLevel: string      // 'less-than-secondary' | 'secondary' | '1-year' | '2-year' | 'bachelors' | 'two-credentials' | 'masters' | 'doctoral'
  canadianEducation: string   // 'none' | '1-2-year' | '3-plus-year'
  ecaCompleted: string        // 'yes' | 'no' | 'not-needed'

  // Work — common
  teerLevel: string           // '0' | '1' | '2' | '3' | '4' | '5' | ''
  foreignWorkYears: string    // numeric string (years)
  canadianWorkMonths: string  // numeric string (months)
  hasJobOffer: string         // 'yes' | 'no' | ''

  // Student-specific
  programLevel: string        // 'college-diploma' | 'bachelor' | 'master' | 'doctoral' | 'other'
  programLengthMonths: string // numeric string
  graduationDate: string      // 'YYYY-MM'

  // Worker-specific
  workPermitType: string      // 'pgwp' | 'lmia' | 'lmia-exempt' | 'open' | 'spousal' | 'other'
  permitExpiry: string        // 'YYYY-MM'

  // Province targeting
  intendedProvince: string
}

export const EMPTY_PROFILE: IntakeData = {
  status: '',
  originCountry: '',
  currentCountry: '',
  province: '',
  city: '',
  goal: '',
  timeline: '',
  age: '',
  maritalStatus: '',
  spouseComing: '',
  langTestType: '',
  langReading: '',
  langWriting: '',
  langListening: '',
  langSpeaking: '',
  educationLevel: '',
  canadianEducation: '',
  ecaCompleted: '',
  teerLevel: '',
  foreignWorkYears: '',
  canadianWorkMonths: '',
  hasJobOffer: '',
  programLevel: '',
  programLengthMonths: '',
  graduationDate: '',
  workPermitType: '',
  permitExpiry: '',
  intendedProvince: '',
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
  'work-permit': 'Work permit holder',
  visitor: 'Visitor / tourist',
  pr: 'Permanent resident',
  other: 'Other',
}

export const goalLabels: Record<string, string> = {
  pr: 'Permanent residence',
  'work-permit': 'Work permit',
  'study-permit': 'Study permit',
  citizenship: 'Citizenship',
  other: 'Other / not sure',
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
