import type { IntakeData } from '@/lib/profile'

export type StepId =
  | 'location-split'
  | 'planned-entry'
  | 'inside-status'
  | 'goal'
  | 'personal'
  | 'early-signup'
  | 'canada-dates'
  | 'pr-status'
  | 'spouse-language'
  | 'language'
  | 'education'
  | 'work'
  | 'settlement'
  | 'province'
  | 'pnp-details'
  | 'manitoba-family'
  | 'risk'

export function getSteps(data: IntakeData): StepId[] {
  const steps: StepId[] = ['location-split']
  if (!data.locationStatus) return steps

  const isInside = data.locationStatus === 'inside'
  const isPR = data.status === 'pr'
  const hasSpouse = (data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && data.spouseComing === 'yes'

  if (isInside) {
    steps.push('inside-status', 'goal')

    if (isPR) {
      // PR flow: dates → personal → language → risk → account
      steps.push('pr-status', 'personal')
      if (hasSpouse) steps.push('spouse-language')
      steps.push('language', 'risk', 'early-signup')
      return steps
    }

    // Inside non-PR: dates early, then core eligibility, then province/PNP
    steps.push('canada-dates', 'personal')
    if (hasSpouse) steps.push('spouse-language')
    const isStudent = data.status === 'student'
    const isWorker = data.status === 'work-permit'
    steps.push('language', 'education', 'work')
    if (!isStudent && !isWorker) steps.push('settlement')
    steps.push('province')
    if (data.intendedProvince && data.intendedProvince !== 'QC') steps.push('pnp-details')
    if (data.intendedProvince === 'MB') steps.push('manitoba-family')
    steps.push('risk', 'early-signup')
    return steps
  }

  // Outside Canada: plan → goal → destination/timeline → core eligibility → PNP → risk → account
  steps.push('planned-entry', 'goal', 'province', 'personal')
  if (hasSpouse) steps.push('spouse-language')
  steps.push('language', 'education', 'work', 'settlement')
  if (data.intendedProvince && data.intendedProvince !== 'QC') steps.push('pnp-details')
  if (data.intendedProvince === 'MB') steps.push('manitoba-family')
  steps.push('risk', 'early-signup')
  return steps
}

export const stepTitles: Record<StepId, string> = {
  'location-split': 'Your location',
  'planned-entry': 'Your plan',
  'inside-status': 'Your status',
  goal: 'Your goal',
  personal: 'Personal details',
  'early-signup': 'Save progress',
  'canada-dates': 'Canada dates',
  'pr-status': 'PR details',
  'spouse-language': 'Spouse details',
  language: 'Language',
  education: 'Education',
  work: 'Work experience',
  settlement: 'Settlement funds',
  province: 'Province',
  'pnp-details': 'Provincial ties',
  'manitoba-family': 'Family in Manitoba',
  risk: 'Background check',
}
